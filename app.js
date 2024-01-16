const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("./util/database");
const expenseRoutes = require("./routes/expense");
const expensetrackerRoutes = require("./routes/expensetracker");
const User = require("./models/user");
const Expense = require("./models/expense");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/expensetracker", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "expensetracker.html"));
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      console.log("User already registered. Please login.");
      return res
        .status(400)
        .json({ error: "User already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const token = generateAccessToken(newUser.id, newUser.name);
    res.json({ success: true, message: "Signup successful!", token: token });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const token = generateAccessToken(user.id, user.name);
        res.json({ success: true, message: "Login successful", token: token });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/expense", expenseRoutes);
app.use("/expensetracker", expensetrackerRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

sequelize
  .sync()
  .then(() => {
    console.log("Sequelize sync successful");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => console.error("Error syncing database:", error));

function generateAccessToken(id, name) {
  return jwt.sign({ userId: id, name: name }, "harish", {
    expiresIn: "1h",
  });
}
