const Expense = require("../models/expense");

exports.addExpense = async (req, res) => {
  try {
    const expense = req.body.expense;
    const description = req.body.description;
    const category = req.body.category;

    const data = await Expense.create({
      expense,
      description,
      category,
      userId: req.user._id,
    });

    req.user.totalAmount = +req.user.totalAmount + +expense;
    req.user.save();

    return res.json({ data });
  } catch (e) {
    console.log(e);
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findByIdAndDelete({
      userId: req.user._id,
      _id: id,
    });
    console.log("return from findById and delete  ");
    console.log(expense);
    req.user.totalAmount =
      Number(req.user.totalAmount) - Number(expense.expense);
    console.log(expense);
    await req.user.save();

    return res.status(200).json({ success: true, msg: "deleted successfully" });
  } catch (e) {
    console.log(e);
    return res.status(401).json({ success: false });
  }
};

exports.editExpense = (req, res) => {
  const id = req.params.id;
  Expense.find({ _id: id, userId: req.user._id })
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
    const page = +req.query.page || 1;
    const items = +req.body.items || 5;
    console.log(items);
    const offset = (page - 1) * items;
    const exp = Expense.find({ userId: req.user._id })
      .skip(offset)
      .limit(items);
    const totalExp = Expense.find({ userId: req.user._id }).countDocuments();
    const [expenses, totalExpenses] = await Promise.all([exp, totalExp]);
    return res.json({ expenses, totalExpenses });
  } catch (e) {
    console.log(e);
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
    let url = fileUrl.Location;
    await req.user.createDownload({ url: url });
    return res.json({ fileUrl: fileUrl.Location, success: true });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

exports.downloadUrls = async (req, res) => {
  try {
    const urls = await req.user.getDownloads();
    return res.json({ success: true, urls });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
