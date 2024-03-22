const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");

const authenticate = async (req, res, next) => {
  try {
    // Extract the token from the request headers
    const token = req.headers["auth-token"];
    console.log("token");
    console.log(token);

    // Verify the token using the JWT_SECRET from environment variables
    const data = jwt.verify(token, process.env.JWT_SECRET);
    console.log(data);

    // Retrieve the user information using the user ID from the token
    const user = await User.findById(data.id);

    // Create a new User instance with the retrieved user data
    const newUser = new User(
      user.name,
      user.email,
      user.password,
      user.isPremiumUser,
      user.totalAmount,
      user._id
    );

    // Attach the user object to the request for further use in routes
    req.user = newUser;

    // Attach additional user properties if needed
    req.isPremiumUser = data.isPremiumUser;

    // Move to the next middleware or route handler
    next();
  } catch (e) {
    console.log(e);
    // Handle errors, such as token verification failure
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

module.exports = authenticate;
