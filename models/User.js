const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema
const UserSchema = new Schema({
  googleID: {
    type: String
  }, 
  stripeAccountId: {
    type: String,
    default: ""
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
  image: {
    type: String
  },
  website: {
    type: String,
    default: ""
  },
  contractUserType: {
    type: String
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