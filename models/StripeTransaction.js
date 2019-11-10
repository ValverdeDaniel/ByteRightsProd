const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Use native promises.
mongoose.Promise = global.Promise;

// Define the Stripe Transaction schema.
const StripeTransactionSchema = new Schema({
  buyerId: { 
    type : Schema.ObjectId, 
    ref : 'users' 
  },
  buyerFirstName: {
    type: String
  },
  buyerLastName: {
    type: String
  },
  sellerId: { 
    type : Schema.ObjectId,
    ref : 'users'
  },
  sellerFirstName: {
    type: String
  },
  sellerLastName: {
    type: String
  },
  proposalId: { 
    type: Schema.ObjectId,
    ref: 'proposals'
  },
  amountBuyerPaid: {
    type: Number
  },
  amountSellerReceived: {
    type: Number
  },
  currency: { 
    type: String, 
    default: 'usd' 
  },
  created: { 
    type: Date, 
    default: Date.now 
  },

  // Stripe Payment Intent ID corresponding to this stripe transaction.
  stripePaymentIntentId: {
    type: String  
  }
});

//create collection and add schema
mongoose.model('stripeTransaction', StripeTransactionSchema, 'stripeTransaction');