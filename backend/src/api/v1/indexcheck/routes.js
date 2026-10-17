const router = require("express").Router();
const { checkAuthStatus, isNotRestrict, requireAdmin } = require("../users/controller");
const {
  checkStandalone,
  checkOrder,
  estimateCost,
  myBatches,
  getBatch,
  batchForOrder,
  adminListBatches,
  adminGetBatch,
} = require("./controller");

// Admin views of every customer's checks. Declared before "/:id" so that
// route never sees "admin" as a batch id.
router.get("/admin/batches", checkAuthStatus, requireAdmin, adminListBatches);
router.get("/admin/batches/:id", checkAuthStatus, requireAdmin, adminGetBatch);

router.get("/estimate", checkAuthStatus, estimateCost);

router.get("/mine", checkAuthStatus, myBatches);

router.get("/for-order/:orderId", checkAuthStatus, batchForOrder);

router.get("/:id", checkAuthStatus, getBatch);

router.post("/standalone", checkAuthStatus, isNotRestrict, checkStandalone);

router.post("/order/:orderId", checkAuthStatus, isNotRestrict, checkOrder);

module.exports = router;
