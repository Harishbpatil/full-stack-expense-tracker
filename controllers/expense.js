const Expense = require("../models/expense");

exports.addExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;

    console.log("Received data:", { amount, description, category });

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const newExpense = await Expense.create({ amount, description, category });

    console.log("Expense added:", newExpense);

    return res.status(201).json({ success: true, expense: newExpense });
  } catch (error) {
    console.error("Error adding expense:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const expenseId = req.params.id;

    const updatedExpense = await Expense.update(
      { amount, description, category },
      { where: { id: expenseId } }
    );

    if (updatedExpense[0] === 1) {
      console.log("Expense updated successfully");
      return res.status(200).json({ success: true });
    } else {
      console.error("Failed to update expense");
      return res.status(404).json({ error: "Expense not found" });
    }
  } catch (error) {
    console.error("Error updating expense:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Error retrieving expenses:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const expense = await Expense.findByPk(expenseId);

    if (expense) {
      return res.status(200).json(expense);
    } else {
      console.error("Expense not found");
      return res.status(404).json({ error: "Expense not found" });
    }
  } catch (error) {
    console.error("Error fetching expense:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const deletedRows = await Expense.destroy({ where: { id: expenseId } });

    if (deletedRows === 1) {
      console.log("Expense deleted successfully");
      return res.status(200).json({ success: true });
    } else {
      console.error("Failed to delete expense");
      return res.status(404).json({ error: "Expense not found" });
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
