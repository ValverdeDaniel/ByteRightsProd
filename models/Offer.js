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
  offerType: {
    type: String
  },
  url: {
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
  offerLink: {
    type: String
  },
  approvalNeeded: {
    type: Boolean,
    default: true,
  },
  welcomeMessage: {
    type: String,
    default: ""
  },
  redemptionInstructions: {
    type: String,
    default: ""
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
  // tag: [{
  //   text: {
  //     type: String,
  //     required: true
  //   },
  //   tagDate: {
  //     type: Date,
  //     default: Date.now
  //   }
  // }],
  // touchedBy:[{
  //   touchedByUser: {
  //     type: Schema.Types.ObjectId,
  //     ref: 'users',
  //     unique: true
  //   }
  // }],
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

  date: {
    type: Date,
    default: Date.now
  }
});

//create collection and add schema
mongoose.model('offers', OfferSchema, 'offers');