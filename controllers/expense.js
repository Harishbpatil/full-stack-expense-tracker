const Expense = require("../models/expense");

exports.getAll = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, msg: "Unauthorized" });
    }

    const expenses = await req.user.getExpenses({
      raw: true,
      attributes: ["id", "expense", "category", "description"],
    });

    return res.json({ data: expenses });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

exports.addExpense = (req, res) => {
  const { expense, description, category } = req.body;

  req.user
    .createExpense({ expense, description, category })
    .then((data) => {
      return res.json({ data });
    })
    .catch((e) => {
      console.error(e);
      return res.status(403).json({ success: false });
    });
};

exports.deleteExpense = (req, res) => {
  const id = req.params.id;
  req.user
    .getExpenses({ where: { id: id } })
    .then((expense) => {
      if (!expense || expense.length === 0) {
        return res
          .status(404)
          .json({ success: false, msg: "Expense not found" });
      }

      return expense[0].destroy();
    })
    .then(() => {
      return res
        .status(200)
        .json({ success: true, msg: "Deleted successfully" });
    })
    .catch((e) => {
      console.error(e);
      return res.status(401).json({ success: false });
    });
};

exports.editExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const expense = await req.user.getExpenses({ where: { id: id } });

    if (!expense || expense.length === 0) {
      return res.status(404).json({ success: false, msg: "Expense not found" });
    }

    // Update the expense fields
    expense[0].expense = req.body.expense || expense[0].expense;
    expense[0].description = req.body.description || expense[0].description;
    expense[0].category = req.body.category || expense[0].category;

    // Save the changes
    await expense[0].save();

    return res.json({ success: true, msg: "Expense updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
