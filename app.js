const express = require("express");
const cors = require("cors");
const sequelize = require("./util/db");
const path = require("path");

const app = express();

// Middleware for Content Security Policy

// Middleware setup
app.use(cors());
app.use(express.json());

// Define models
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");

// Define associations
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

// Define routes
const expenseRoutes = require("./routes/expense");
const userRoutes = require("./routes/user");
const paymentsRoutes = require("./routes/purchase");

// Serving static files
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use(express.static(path.join(__dirname, "views")));
app.use(express.static("public"));

app.use(
  express.static("public", {
    setHeaders: (res, path, stat) => {
      if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

app.use("/expense", expenseRoutes);
app.use("/user", userRoutes);
app.use("/payment", paymentsRoutes);

// Root path route handler
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signup.html"));
});

// Login page route handler
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Sync database and start server
sequelize
  .sync()
  .then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error("Error syncing with the database:", e);
    process.exit(1); // Exit the process with an error code
  });

module.exports = app; // Export the app for testing purposes if needed
