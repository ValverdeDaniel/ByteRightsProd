const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema
const UserSchema = new Schema({
  googleID: {
    type: String
  }, 
  email: {
    type: String
  },
  firstName: {
    type: String

  },
  lastName: {
    type: String

  },
  password: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  image: {
    type: String
  },
  website: {
    type: String,
    default: ""
  },
  facebookID: {
    type: String
  },
  facebookDisplayName: {
    type: String
  },
  instagram: {
    type: String,
    default: ""
  },
  facebook: {
    type: String,
    default: ""
  },
  twitter: {
    type: String,
    default: ""
  },
  youtube: {
    type: String,
    default: ""
  },
  soundcloud: {
    type: String,
    default: ""
  },
  companyName:{
    type: String,
    default: ""
  }
});

//create collection and add schema
mongoose.model('users', UserSchema);