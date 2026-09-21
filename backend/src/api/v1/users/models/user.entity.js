const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 4,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate:
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    password: {
      type: String,
      required: true,
      validate: /^.{5,}$/,
    },
    isRestrict: {
      type: Boolean,
      default: false,
    },
    totalLinks: {
      type: Number,
      default: 0,
    },
    // Cached running balance — the credit ledger (creditTransaction
    // collection) is the source of truth; this column exists so reads don't
    // have to aggregate the ledger every time. Kept in sync inside a single
    // transaction by src/services/credits.js.
    creditBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Lifetime total of every credit ever granted (PayPal purchases + manual
    // admin additions) - unlike creditBalance, this only ever goes up, so it
    // stays meaningful after the balance has been spent down. Kept in sync
    // alongside creditBalance by src/services/credits.js.
    creditsPurchased: {
      type: Number,
      default: 0,
      min: 0,
    },
    // What scripts/import-legacy-counters.js has already carried over from
    // this user's record in the old system (uservariables collection). The
    // script only applies the difference between this snapshot and the
    // current legacy values, so it's safe to re-run while the old system is
    // still live and picks up whatever changed since the last run.
    legacyImport: {
      totalLimit: Number,
      totalLinks: Number,
      isRestrict: Boolean,
      importedAt: Date,
    },
    forgotPasswordToken: {
      type: String,
    },
    otpSecret: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
