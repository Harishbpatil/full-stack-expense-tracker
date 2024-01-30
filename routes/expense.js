const express = require("express");
const router = express.Router();

const Expense = require("../models/expense");
const expense = require("../controllers/expense");

const authenticate = require("../middleware/auth");

router.get("/", authenticate, expense.getAll);

router.post("/add-expense", authenticate, expense.addExpense);

router.delete("/deleteExpense/:id", authenticate, expense.deleteExpense);

router.post("/edit-expense/:id", authenticate, expense.editExpense);

router.get("/get-expense", authenticate, expense.getExpenses);

module.exports = router;
