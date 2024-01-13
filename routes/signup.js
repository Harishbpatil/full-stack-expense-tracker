const express = require("express");
const router = express.Router();
const User = require("../models/user");

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

module.exports = router;
