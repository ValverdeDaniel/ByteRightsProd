const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema
const OfferSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  ogOwner: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  ogOfferId: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  offerType: {
    type: String
  },
  url: {
    type: String,
  },
  imageUrl: {
    type: String
  },
  contractUserType: {
    type: String,
  },
  compensation: {
    type: String
  },
  usage: {
    type: String
  },
  credit: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    default: 'Created'
  },
  allowComments: {
    type: Boolean,
    default: true

  },
  igUsername: {
    type: String,
    default: ""
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
      default: true
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
      type: String,
      default: ""
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
  offerLink: {
    type: String
  },
  approvalNeeded: {
    type: Boolean,
  },
  welcomeMessage: {
    type: String,
    default: ""
  },
  redemptionInstructions: {
    type: String,
    default: ""
  },
  date: {
    type: Date,
    default: Date.now
  }
});

//create collection and add schema
mongoose.model('offers', OfferSchema, 'offers');