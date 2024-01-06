const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense");

router.post("/addExpense", expenseController.addExpense);
router.put("/updateExpense/:id", expenseController.updateExpense);
router.get("/getExpenses", expenseController.getExpenses);
router.get("/getExpense/:id", expenseController.getExpense);
router.delete("/deleteExpense/:id", expenseController.deleteExpense);

module.exports = router;
