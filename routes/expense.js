const express = require("express");
const router = express.Router();

const Expense = require("../models/expense");
const expense = require("../controllers/expense");

const authenticate = require("../middleware/auth");

router.get("/", authenticate, expense.getAll); //fetch all the expense

router.post("/add-expense", authenticate, expense.addExpense); // add a new expense

router.delete("/deleteExpense/:id", authenticate, expense.deleteExpense); // delete a expense

router.post("/edit-expense/:id", authenticate, expense.editExpense);

module.exports = router;
