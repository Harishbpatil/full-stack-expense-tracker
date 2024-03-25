const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense");
const authenticate = require("../middleware/auth");

router.post("/add-expense", authenticate, expenseController.addExpense);
router.delete(
  "/deleteExpense/:id", // Change the route definition to match frontend
  authenticate,
  expenseController.deleteExpense
);
router.put("/edit-expense/:id", authenticate, expenseController.editExpense);
router.get("/get-expenses", authenticate, expenseController.getExpenses);
router.get("/download", authenticate, expenseController.downloadExpenses);
router.get("/get-all-urls", authenticate, expenseController.downloadUrls);

module.exports = router;
