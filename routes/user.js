const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { hashPassword } = require("../app");

// Signup route
router.post("/signup", async (req, res) => {
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

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    res.json({ success: true, message: "Signup successful!", user: newUser });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
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
        req.session.user = user;
        res.json({ success: true, message: "Login successful" });
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

module.exports = router;
