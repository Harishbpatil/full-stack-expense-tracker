// auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers["auth-token"];
    console.log("token");
    console.log(token);
    const data = await jwt.verify(token, "secretkey");
    console.log(data);
    const user = await User.findByPk(data.id);

    req.user = user;
    req.isPremiumUser = user.isPremiumUser; 
    next();
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

module.exports = authenticate;
