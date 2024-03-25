const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    let result = await User.findOne({ email: email });

    if (result !== null)
      return res
        .status(401)
        .json({ success: false, msg: "User already exists" });

    let hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name,
      email: email,
      password: hash,
    });

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    return res.json(userWithoutPassword);
  } catch (e) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });

    if (user === null) {
      return res.status(401).json({ success: false, msg: "User not found" });
    }

    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const token = jwt.sign(
        { id: user._id, isPremiumUser: user.isPremiumUser },
        process.env.JWT_SECRET
      );
      return res.json({
        success: true,
        token,
        isPremiumUser: user.isPremiumUser,
      });
    } else {
      return res
        .status(401)
        .json({ success: false, msg: "Incorrect password" });
    }
  } catch (e) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};
