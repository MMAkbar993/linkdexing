// Carries each user's history over from the old system's `uservariables`
// collection into the fields the current code reads:
//
//   uservariables.totalLimit  (lifetime credits bought)  -> User.creditsPurchased
//   uservariables.totalLinks  (lifetime links submitted) -> User.totalLinks
//   totalLimit - totalLinks   (unused credits)           -> User.creditBalance
//   uservariables.isRestrict                             -> User.isRestrict
//   uservariables.otpSecret   (email never verified)     -> User.otpSecret
//
// Re-runnable. Each user remembers what was already imported
// (User.legacyImport), and a run only applies the difference since then —
// so while the old system is still live and changing these numbers, run it
// once now and again at cutover to pick up everything in between. Running
// it twice in a row with nothing changed does nothing.
//
// Every balance change is also written to the credit ledger as a
// "legacy_import" entry, so the ledger still adds up to the balance.
//
// Old password-reset tokens are deliberately NOT copied, so stale reset
// links from years ago don't start working again.
//
// Usage:
//   node scripts/import-legacy-counters.js           # dry run, writes nothing
//   node scripts/import-legacy-counters.js --apply   # actually writes

require("dotenv/config");
const mongoose = require("mongoose");
const User = require("../src/api/v1/users/models/user.entity");
const CreditTransaction = require("../src/models/creditTransaction.entity");

const APPLY = process.argv.includes("--apply");

const round2 = (n) => Math.round(n * 100) / 100;

function planFor(user, legacy) {
  const snap = user.legacyImport || {};
  const firstImport = !snap.importedAt;

  const deltaLimit = (legacy.totalLimit || 0) - (snap.totalLimit || 0);
  const deltaUsed = (legacy.totalLinks || 0) - (snap.totalLinks || 0);

  const currentBalance = user.creditBalance || 0;
  const currentPurchased = user.creditsPurchased || 0;
  const currentUsed = user.totalLinks || 0;

  const newBalance = Math.max(round2(currentBalance + deltaLimit - deltaUsed), 0);
  const newPurchased = Math.max(round2(currentPurchased + deltaLimit), 0);
  const newUsed = Math.max(currentUsed + deltaUsed, 0);

  // On the first import, legacy restriction adds to (never lifts) whatever
  // the new system has. After that, only follow the old admin if it
  // actually changed the flag since the last run.
  let newRestrict = user.isRestrict;
  if (firstImport) {
    newRestrict = Boolean(user.isRestrict) || Boolean(legacy.isRestrict);
  } else if (Boolean(legacy.isRestrict) !== Boolean(snap.isRestrict)) {
    newRestrict = Boolean(legacy.isRestrict);
  }

  const copyOtp = firstImport && legacy.otpSecret && !user.otpSecret;

  const changed =
    newBalance !== currentBalance ||
    newPurchased !== currentPurchased ||
    newUsed !== currentUsed ||
    Boolean(newRestrict) !== Boolean(user.isRestrict) ||
    copyOtp ||
    firstImport;

  return {
    changed,
    firstImport,
    balanceDelta: round2(newBalance - currentBalance),
    set: {
      creditBalance: newBalance,
      creditsPurchased: newPurchased,
      totalLinks: newUsed,
      isRestrict: Boolean(newRestrict),
      ...(copyOtp ? { otpSecret: legacy.otpSecret } : {}),
      legacyImport: {
        totalLimit: legacy.totalLimit || 0,
        totalLinks: legacy.totalLinks || 0,
        isRestrict: Boolean(legacy.isRestrict),
        importedAt: new Date(),
      },
    },
    clampedNegative: currentBalance + deltaLimit - deltaUsed < 0,
    copyOtp,
    restrictChanged: Boolean(newRestrict) !== Boolean(user.isRestrict),
  };
}

async function applyPlan(user, plan) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Guard on the snapshot we planned from, so two overlapping runs
      // can't both apply the same delta.
      const filter = { _id: user._id };
      if (user.legacyImport?.importedAt) {
        filter["legacyImport.importedAt"] = user.legacyImport.importedAt;
      } else {
        filter["legacyImport.importedAt"] = { $exists: false };
      }

      const res = await User.updateOne(filter, { $set: plan.set }, { session });
      // Mongoose 5 reports `n`; newer drivers report `matchedCount`.
      if (!(res.matchedCount ?? res.n)) {
        throw new Error(`user ${user._id} changed during the run - re-run to retry it`);
      }

      if (plan.balanceDelta !== 0) {
        await CreditTransaction.create(
          [
            {
              userId: user._id,
              amount: plan.balanceDelta,
              balanceAfter: plan.set.creditBalance,
              type: "legacy_import",
              reason: plan.firstImport
                ? "Balance carried over from the previous system"
                : "Previous-system activity since the last import",
            },
          ],
          { session }
        );
      }
    });
  } finally {
    session.endSession();
  }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  const legacyCol = mongoose.connection.db.collection("uservariables");

  console.log(APPLY ? "=== APPLYING (writes to the database) ===" : "=== DRY RUN (writes nothing) ===");

  const totals = {
    legacyRecords: 0,
    orphaned: 0,
    toUpdate: 0,
    unchanged: 0,
    creditsRestored: 0,
    purchasedAdded: 0,
    usedAdded: 0,
    restrictChanges: 0,
    otpCopied: 0,
    clampedNegative: 0,
    failed: 0,
  };
  const biggest = [];

  // One query for every user up front, rather than one round trip per
  // legacy record - the difference between seconds and many minutes
  // against a remote Atlas cluster.
  const usersById = new Map();
  for await (const u of User.find({}).cursor()) {
    usersById.set(String(u._id), u);
  }
  console.log(`Loaded ${usersById.size} users.`);

  const legacyRecords = await legacyCol.find({}).toArray();
  for (const legacy of legacyRecords) {
    totals.legacyRecords++;

    const user = usersById.get(String(legacy.user));
    if (!user) {
      totals.orphaned++;
      continue;
    }

    const plan = planFor(user, legacy);
    if (!plan.changed) {
      totals.unchanged++;
      continue;
    }

    totals.toUpdate++;
    totals.creditsRestored = round2(totals.creditsRestored + plan.balanceDelta);
    totals.purchasedAdded = round2(
      totals.purchasedAdded + (plan.set.creditsPurchased - (user.creditsPurchased || 0))
    );
    totals.usedAdded += plan.set.totalLinks - (user.totalLinks || 0);
    if (plan.restrictChanged) totals.restrictChanges++;
    if (plan.copyOtp) totals.otpCopied++;
    if (plan.clampedNegative) totals.clampedNegative++;

    biggest.push({ email: user.email, before: user.creditBalance || 0, after: plan.set.creditBalance });

    if (APPLY) {
      try {
        await applyPlan(user, plan);
      } catch (err) {
        totals.failed++;
        console.error(`  failed for ${user.email}: ${err.message}`);
      }
    }

    if (totals.legacyRecords % 1000 === 0) {
      console.log(`  ...${totals.legacyRecords} records checked`);
    }
  }

  console.log("\nSummary:");
  console.log(`  legacy records checked:         ${totals.legacyRecords}`);
  console.log(`  users to update:                ${totals.toUpdate}`);
  console.log(`  already up to date:             ${totals.unchanged}`);
  console.log(`  legacy records with no user:    ${totals.orphaned}`);
  console.log(`  unused credits restored:        ${totals.creditsRestored}`);
  console.log(`  lifetime purchased carried over: ${totals.purchasedAdded}`);
  console.log(`  lifetime links used carried over: ${totals.usedAdded}`);
  console.log(`  restriction flag changes:       ${totals.restrictChanges}`);
  console.log(`  pending email verifications:    ${totals.otpCopied}`);
  console.log(`  balances clamped at 0:          ${totals.clampedNegative}`);
  if (APPLY) console.log(`  failed:                         ${totals.failed}`);

  console.log("\nLargest balances restored:");
  biggest
    .sort((a, b) => b.after - b.before - (a.after - a.before))
    .slice(0, 10)
    .forEach((b) => console.log(`  ${b.email.padEnd(40)} ${b.before} -> ${b.after}`));

  if (!APPLY) console.log("\nNothing was written. Re-run with --apply to make these changes.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
