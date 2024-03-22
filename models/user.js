const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isPremiumUser: {
    type: Boolean,
    default: false,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
});

// Define the getDownloads method
userSchema.methods.getDownloads = async function() {
  // Your implementation here
  // Example: Retrieve downloads associated with this user
  // const downloads = await Download.find({ userId: this._id });
  // return downloads;
};

module.exports = mongoose.model("User", userSchema);
