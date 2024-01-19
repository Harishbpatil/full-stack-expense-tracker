const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers["auth-token"];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, msg: "Unauthorized access - Token missing" });
    }

    const data = await jwt.verify(token, "secretkey");
    console.log("Decoded Token:", data); //debugging
    const user = await User.findByPk(data.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Unauthorized access - User not found" });
    }

    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

module.exports = authenticate;
