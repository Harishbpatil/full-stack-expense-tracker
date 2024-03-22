const express = require("express");
const cors = require("cors");
const path = require("path");

const compression = require("compression");
const morgan = require("morgan");
//const helmet = require('helmet')
const fs = require("fs");
const https = require("https");
require("dotenv").config();

const app = express();

const sequelize = require("./util/db");

// const expenseRoutes = require("./routes/expense");
const userRoutes = require("./routes/user");
// const paymentsRoutes = require("./routes/purchase");

// const User = require("./models/user");
// const Expense = require("./models/expense");
// const Order = require("./models/order");
// const premiumRoutes = require("./routes/premium");
// const passwordRoutes = require("./routes/forgot-password");
// const resetPassword = require("./models/resetPassword");
// const Download = require("./models/download");
// const reportRoutes = require("./routes/report");
const mongoose = require("mongoose");
app.use(cors());
app.use(express.json());

// User.hasMany(Expense);
// Expense.belongsTo(User);

// User.hasMany(Order);
// Order.belongsTo(User);

// User.hasMany(resetPassword);
// resetPassword.belongsTo(User);

// User.hasMany(Download);
// Download.belongsTo(User);

app.use(express.static(path.join(__dirname, "public")));

// app.use("/premium", premiumRoutes);
// app.use("/password", passwordRoutes);
// app.use("/report", reportRoutes);

app.use(compression());
app.use(express.json());
// app.use(helmet())

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("combined", { stream: accessLogStream }));

app.get("/public/:filepath*", (req, res) => {
  const filepath = req.params.filepath;
  res.sendFile(path.join(__dirname, "public", filepath));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/signup/signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login/login.html"));
});

app.get("/expensetracker", (req, res) => {
  res.sendFile(
    path.join(__dirname, "/public/expensetracker/expensetracker.html")
  );
});

// app.use("/expense", expenseRoutes);
app.use("/user", userRoutes);
// app.use("/payment", paymentsRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected");
    app.listen(4000);
  })
  .catch((e) => console.log(e));
