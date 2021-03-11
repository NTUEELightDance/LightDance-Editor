const mongoose = require("mongoose");

const { Schema } = mongoose;

// Creating a schema, sort of like working with an ORM
const UserSchema = new Schema({
  time: { type: Date, default: Date.now },
  username: {
    type: String,
    required: [true, "Name field is required."],
  },
  password: {
    type: String,
    required: [true, "Name field is required."],
  },
});

// Creating a table within database with the defined schema
const User = mongoose.model("user", UserSchema);

// Exporting table for querying and mutating
module.exports = User;
