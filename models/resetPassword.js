const mongoose = require("mongoose");
const { Schema } = mongoose;

const resetPassword = new Schema({
  isActive: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = mongoose.model("resetPasswords", resetPassword);
