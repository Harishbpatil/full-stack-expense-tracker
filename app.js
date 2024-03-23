const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
require("dotenv").config();

const app = express();
const mongoose = require("mongoose");

const authenticate = require("./middleware/auth");
const expenseController = require("./controllers/expense");
const userRoutes = require("./routes/user");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(express.static(path.join(__dirname, "public")));

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

app.get("/premium/checkPremium", (req, res) => {
  res.sendFile(
    path.join(__dirname, "/public/expensetracker/expensetracker.html")
  );
});

app.get("/expense/get-all-urls", authenticate, expenseController.downloadUrls);
app.post("/expense/add-expense", authenticate, expenseController.addExpense);
app.delete(
  "/expense/deleteExpense/:id",
  authenticate,
  expenseController.deleteExpense
); // Endpoint for deleting expense
app.post(
  "/expense/edit-expense/:id",
  authenticate,
  expenseController.editExpense
); // Endpoint for editing expense
app.post("/expense/get-expense", authenticate, expenseController.getExpenses);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
