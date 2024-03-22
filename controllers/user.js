const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    let result = await User.findOne({ email: email });
    // console.log("line 14")
    // return res.json(result)
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

    console.log(user);
    const userWithoutPassword = user.toJSON();
    console.log(userWithoutPassword);
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
    console.log(email);
    const user = await User.findOne({ email: email });
    console.log(user);

    if (user === null) {
      return res.status(401).json({ success: false, msg: "wrong credentials" });
    }

    const result = await bcrypt.compare(password, user.password);
    if (result) {
      console.log(user._id);
      const token = jwt.sign(
        { id: user._id, isPremiumUser: user.isPremiumUser },
        process.env.JWT_SECRET
      );
      console.log(token);
      return res.json({
        success: true,
        token,
        isPremiumUser: user.isPremiumUser,
      });
    } else {
      return res.status(401).json({ success: false, msg: "wrong credentials" });
    }
  } catch (e) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};
