const mongoose = require("mongoose");
const { Schema } = mongoose;

const authorSchema = new Schema({
  name: String,
  age: Number
});

module.exports = authorSchema;