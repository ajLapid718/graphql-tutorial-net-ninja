const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new Schema({
  name: String,
  genre: String,
  authorId: String
});

module.exports = bookSchema;