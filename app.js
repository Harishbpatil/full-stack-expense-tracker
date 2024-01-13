const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const sequelize = require("./util/database");
const expenseRoutes = require("./routes/expense");
const expensetrackerRoutes = require("./routes/expensetracker");
const User = require("./models/user");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: " ",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/expensetracker", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "views", "expensetracker.html"));
  } else {
    res.redirect("/");
  }
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

    const newUser = await User.create({
      name: name,
      email: email,
      password: password,
    });

    res.json({ success: true, message: "Signup successful!", user: newUser });
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
        password: password,
      },
    });

    if (user) {
      req.session.user = user;
      res.json({ success: true, message: "Login successful" });
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

sequelize
  .sync()
  .then(() => {
    console.log("Sequelize sync successful");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => console.error("Error syncing database:", error));
