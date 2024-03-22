const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const paymentsController = require("../controllers/purchase");

router.post("/purchaseMembership", auth, paymentsController.purchaseMembership);

router.post("/success", auth, paymentsController.successfulTransaction);

router.post("/failed", auth, paymentsController.failedTransaction);

module.exports = router;
