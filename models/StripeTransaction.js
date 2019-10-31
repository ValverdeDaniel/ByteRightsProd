'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Use native promises.
mongoose.Promise = global.Promise;

// Define the Stripe Transaction schema.
const StripeTransactionSchema = new Schema({
  sender: { type : Schema.ObjectId, ref : 'users', required: true },
  receiver: { type : Schema.ObjectId, ref : 'users', required: true },
  amount: Number,
  currency: { type: String, default: 'usd' },
  created: { type: Date, default: Date.now },

  // Stripe Payment Intent ID corresponding to this stripe transaction.
  stripePaymentIntentId: String
});

// Return the stripe transaction amount for the receiver after collecting 20% platform fees.
StripeTransactionSchema.methods.amountForReceiver = function() {
  return parseInt(this.amount * 0.8);
};

const StripeTransaction = mongoose.model('stripeTransaction', StripeTransactionSchema);

module.exports = StripeTransaction;
