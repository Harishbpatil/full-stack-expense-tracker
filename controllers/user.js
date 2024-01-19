const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Utility function for generating JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "secretkey");
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser !== null) {
      return res.status(401).json({ success: false, msg: "User already exists" });
    }

    // Hash the password and create a new user
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name,
      email: email,
      password: hash,
    });

    // Remove password from the response
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    return res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email: email } });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ success: false, msg: "Wrong credentials" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Generate and send JWT token
      const token = generateToken(user.id);
      return res.json({ success: true, token });
    } else {
      return res.status(401).json({ success: false, msg: "Wrong credentials" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Internal server error" });
  }
};
