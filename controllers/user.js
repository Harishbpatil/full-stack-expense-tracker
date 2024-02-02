const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");

exports.createUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const ispremiumuser = req.body.ispremiumuser;

    let result = await User.findOne({ where: { email: email } });

    if (result !== null)
      return res
        .status(401)
        .json({ success: false, msg: "User already exists" });

    let hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name,
      email: email,
      password: hash,
      ispremiumuser: ispremiumuser,
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
    const user = await User.findOne({ where: { email: email } });

    if (user === null) {
      return res.status(401).json({ success: false, msg: "Wrong credentials" });
    }

    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const token = jwt.sign(
        { id: user.id, ispremiumuser: user.ispremiumuser },
        "secretkey"
      );
      return res.json({
        success: true,
        token,
        ispremiumuser: user.ispremiumuser,
      });
    } else {
      return res.status(401).json({ success: false, msg: "Wrong credentials" });
    }
  } catch (e) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};

