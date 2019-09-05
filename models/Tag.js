const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema
const TagSchema = new Schema({
  text: {
    type: String,
    required: true
  }
});

//create collection and add schema
mongoose.model('tags', TagSchema);