const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const sequelize = require("./util/db");

const expenseRoutes = require("./routes/expense");
const userRoutes = require("./routes/user");
const paymentsRoutes = require("./routes/purchase");

const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");

app.use(cors());
app.use(express.json());

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "views")));
// Render the signup page when accessing the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/signup.html"));
});

// Render the login page when accessing the /login path
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/login.html"));
});

// Render the expensetracker page when accessing the /expensetracker path
app.get("/expensetracker", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/expensetracker.html"));
});

app.use("/expense", expenseRoutes);
app.use("/user", userRoutes);
app.use("/payment", paymentsRoutes);

sequelize
  .sync()
  .then((result) => {
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  })
  .catch((e) => console.log(e));
