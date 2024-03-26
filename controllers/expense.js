const Expense = require("../models/expense");
const S3Services = require("../services/s3services");

exports.addExpense = async (req, res) => {
  try {
    const { expense, description, category } = req.body;
    const data = await Expense.create({
      expense,
      description,
      category,
      userId: req.user._id,
    });

    req.user.totalAmount += +expense;
    await req.user.save();

    return res.json({ data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findOneAndDelete({
      userId: req.user._id,
      _id: id,
    });
    if (!expense) {
      return res.status(404).json({ success: false, msg: "Expense not found" });
    }
    req.user.totalAmount -= +expense.expense;
    await req.user.save();
    return res
      .status(200)
      .json({ success: true, msg: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

// controllers/expense.js

exports.editExpense = async (req, res) => {
  try {
    const id = req.params.id; // Get the id from the request parameters
    if (!id) {
      return res
        .status(400)
        .json({ success: false, msg: "Expense ID is required" });
    }

    const { expense, description, category } = req.body;
    if (!expense || !description || !category) {
      return res
        .status(400)
        .json({ success: false, msg: "Expense details are incomplete" });
    }

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { expense, description, category },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ success: false, msg: "Expense not found" });
    }

    return res.json({ success: true, data: updatedExpense });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const items = +req.query.items || 5;
    const offset = (page - 1) * items;
    const expenses = await Expense.find({ userId: req.user._id })
      .skip(offset)
      .limit(items);
    const totalExpenses = await Expense.countDocuments({
      userId: req.user._id,
    });
    return res.json({ expenses, totalExpenses });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

exports.downloadExpenses = async (req, res) => {
  try {
    const expenses = await req.user.getExpenses();
    const expensesToString = JSON.stringify(expenses);
    const fileName = `expense${req.user.id}/${new Date()}.txt`;
    const fileUrl = await S3Services.uploadToS3(expensesToString, fileName);
    await req.user.createDownload({ url: fileUrl.Location });
    return res.json({ fileUrl: fileUrl.Location, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

exports.downloadUrls = async (req, res) => {
  try {
    const urls = await req.user.getDownloads();
    return res.json({ success: true, urls });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
