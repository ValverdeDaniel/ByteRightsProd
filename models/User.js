const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema
const UserSchema = new Schema({
  googleID: {
    type: String
  }, 
  instagramID: {
    type: String
  },
  instagramDisplayName: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String

  },
  lastName: {
    type: String

  },
  image: {
    type: String
  }
});

//create collection and add schema
mongoose.model('users', UserSchema);