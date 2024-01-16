const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const userauthentication = require("../middleware/auth");

// Add an expense
router.post(
  "/addExpense",
  userauthentication.authenticate,
  async (req, res) => {
    try {
      const { amount, description, category, userId } = req.body;

      if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
      }

      const newExpense = await Expense.create({
        amount,
        description,
        category,
        userId,
      });

      return res.status(201).json({ success: true, expense: newExpense });
    } catch (error) {
      console.error("Error adding expense:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update an expense
router.put(
  "/updateExpense/:id",
  userauthentication.authenticate,
  async (req, res) => {
    try {
      const { amount, description, category } = req.body;
      const expenseId = req.params.id;

      const updatedExpense = await Expense.update(
        { amount, description, category },
        { where: { id: expenseId } }
      );

      if (updatedExpense[0] === 1) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(404).json({ error: "Expense not found" });
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all expenses
router.get(
  "/getExpenses",
  userauthentication.authenticate,
  async (req, res) => {
    try {
      const expenses = await Expense.findAll();
      return res.status(200).json({ success: true, expenses });
    } catch (error) {
      console.error("Error retrieving expenses:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get a single expense by ID
router.get(
  "/getExpense/:id",
  userauthentication.authenticate,
  async (req, res) => {
    try {
      const expenseId = req.params.id;
      const expense = await Expense.findByPk(expenseId);

      if (expense) {
        return res.status(200).json({ success: true, expense });
      } else {
        return res.status(404).json({ error: "Expense not found" });
      }
    } catch (error) {
      console.error("Error fetching expense:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete an expense by ID
router.delete(
  "/deleteExpense/:id",
  userauthentication.authenticate,
  async (req, res) => {
    try {
      const expenseId = req.params.id;
      const deletedRows = await Expense.destroy({ where: { id: expenseId } });

      if (deletedRows === 1) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(404).json({ error: "Expense not found" });
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
