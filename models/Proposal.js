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
  recipient: {
    type: String
  },
  compensation: {
    type: String
  },
  // this is where i am trying to generate a random number for the pin
  randomPin: {
    type: String
  },
  status: {
    type: String,
    default: 'public'
  },
  allowComments: {
    type: Boolean,
    default: true

  },
  tag: [{
    text: {
      type: String,
      required: true
    },
    tagDate: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    commentBody: {
      type: String,
      required: true
    },
    commentDate: {
      type: Date,
      default: Date.now
    },
    commentUser: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  }],
  votes: [{
    voteBody: {
      type: String
    },
    voteEmail: {
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
  date: {
    type: Date,
    default: Date.now
  }
});

//create collection and add schema
mongoose.model('proposals', ProposalSchema, 'proposals');