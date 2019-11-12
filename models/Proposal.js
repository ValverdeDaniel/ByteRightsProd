const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema
const ProposalSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  // this is where i am trying to generate a random number for the pin
  url: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  contractUserType: {
    type: String,
  },
  recipient: {
    type: String
  },
  compensation: {
    type: String
  },
  price: {
    type: Number
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
  sellerStripeAccountId: {
    type: String,
    default: ""
  },
  paidStatus: {
    type: String,
    default: ""
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
  touchedBy:[{
    touchedByUser: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      unique: true
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
  date: {
    type: Date,
    default: Date.now
  }
});

//create collection and add schema
mongoose.model('proposals', ProposalSchema, 'proposals');