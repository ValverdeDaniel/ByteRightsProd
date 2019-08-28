const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema
const ProfileSchema = new Schema({
  user: {      
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  // this is where i am trying to generate a random number for the pin
  business: {
    type: String
  },
  date:{
    type: Date,
    default: Date.now
  }
});

//create collection and add schema
mongoose.model('profiles', ProfileSchema, 'profiles');