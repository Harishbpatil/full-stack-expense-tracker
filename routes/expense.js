const express = require("express");
const router = express.Router();
const ExpenseController = require("../controllers/expense");
const authenticate = require("../middleware/auth");

router.get("/", authenticate, ExpenseController.getAll);
router.post("/add-expense", authenticate, ExpenseController.addExpense);
router.delete(
  "/deleteExpense/:id",
  authenticate,
  ExpenseController.deleteExpense
);
router.post("/edit-expense/:id", authenticate, ExpenseController.editExpense);

module.exports = router;
