const mongoose = require("mongoose");
const { Schema } = mongoose;

const downloadSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = mongoose.model("downloads", downloadSchema);
