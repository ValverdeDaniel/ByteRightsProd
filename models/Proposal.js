const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema
const ProposalSchema = new Schema({
  user: {      
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  url: {
    type: String,
    required: true

  }, 
  imageUrl: {
    type: String,
  },
  compensation: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'public'
  
  },
  allowComments: {
    type: Boolean,
    default: true

  },
  comments: [{
    commentBody: {
      type: String,
      required: true 
    },
    commentDate: {
      type: Date,
      default: Date.now
    },
    commentUser:{
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  }],
  votes: [{
    voteBody: {
      type: String
    },
    voteDate: {
      type: Date,
      default: Date.now
    },
    voteUser: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  }],

  igProfile: {
    type: String
  },
  date:{
    type: Date,
    default: Date.now
  }
});

//create collection and add schema
mongoose.model('proposals', ProposalSchema, 'proposals');