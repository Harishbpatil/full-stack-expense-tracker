const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const tokenParts = token.split(" ");

    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const decoded = jwt.verify(tokenParts[1], "harish");
    const userId = decoded.userId;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("Error:", err);
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

module.exports = { authenticate };
