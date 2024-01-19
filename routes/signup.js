const express = require("express");
const router = express.Router();
const User = require("../models/user");
const axios = require("axios");

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

    // Assuming you have a separate endpoint for signup in the frontend
    // Adjust the URL as needed
    const response = await axios.post("http://localhost:4000/user/signup", {
      name: newUser.name,
      email: newUser.email,
    });

    console.log(response.data);
    alert("Signup Successfully!!, You Can Login Now!");
    res.json({ success: true, message: "Signup successful!", user: newUser });
  } catch (error) {
    console.error("Error during signup:", error);

    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

module.exports = router;
