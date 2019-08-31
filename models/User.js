const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema
const UserSchema = new Schema({
  googleID: {
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
  },
  website: {
    type: String
  },
  instagram: {
    type: String
  },
  facebook: {
    type: String
  },
  twitter: {
    type: String
  },
  youtube: {
    type: String
  },
  soundcloud: {
    type: String
  },
  companyName:{
    type: String
  }
});

//create collection and add schema
mongoose.model('users', UserSchema);