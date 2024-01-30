const Expense = require("../models/expense");
const S3Services = require("../services/s3services");

exports.getAll = (req, res) => {
  req.user
    .getExpenses({
      raw: true,
      attributes: ["id", "expense", "category", "description"],
    })
    .then((data) => {
      return res.json({ data });
    })
    .catch((e) => {
      console.log(e);
      return res.status(500).json({ msg: "Internal server error" });
    });
};

exports.addExpense = (req, res) => {
  const expense = req.body.expense;
  const description = req.body.description;
  const category = req.body.category;

  req.user
    .createExpense({
      expense: expense,
      description: description,
      category: category,
    })
    .then(async (data) => {
      req.user.totalAmount = req.user.totalAmount + +expense;
      await req.user.save();
      return res.json({ data });
    })
    .catch((e) => {
      console.log(e);
      return res.status(403).json({ success: false });
    });
};

exports.deleteExpense = async (req, res) => {
  const id = req.params.id;

  return Expense.sequelize.transaction(async (t) => {
    try {
      const expense = await req.user.getExpenses({
        where: { id: id },
        transaction: t,
      });

      if (!expense || expense.length === 0) {
        return res
          .status(404)
          .json({ success: false, msg: "Expense not found" });
      }

      req.user.totalAmount -= Number(expense[0].expense);
      await req.user.save({ transaction: t });

      await expense[0].destroy({ transaction: t });

      return res
        .status(200)
        .json({ success: true, msg: "Deleted successfully" });
    } catch (e) {
      console.log(e);
      // Rollback the transaction in case of an error
      await t.rollback();
      return res
        .status(500)
        .json({ success: false, msg: "Internal server error" });
    }
  });
};

exports.editExpense = (req, res) => {
  const id = req.params.id;
  req.user
    .getExpenses({ where: { id: id } })
    .then((data) => {
      (data[0].expense = req.body.expense),
        (data[0].description = req.body.description),
        (data[0].category = req.body.category);
      return data[0].save();
    })
    .then(() => {
      return res.json({ success: true });
    })
    .catch((e) => {
      console.log(e);
      return res.status(403).json({ success: false });
    });
};

exports.getExpenses = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const exp = req.user.getExpenses({
      offset: (page - 1) * 2,
      limit: 2,
    });
    const totalExp = req.user.countExpenses();
    const [expenses, totalExpenses] = await Promise.all([exp, totalExp]);
    return res.json({ expenses, totalExpenses });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
