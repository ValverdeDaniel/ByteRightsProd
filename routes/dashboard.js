const config = require('../config/stripe');
//not so sure about this stripe second part of require
// const stripe = require('stripe')('../config.stripe.stripe.secretKey');
const stripe = require('stripe')(config.stripe.secretKey);
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = mongoose.model('proposals');
const User = mongoose.model('users');
const StripeTransaction = mongoose.model('stripeTransaction');
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');

router.get('/edit', ensureAuthenticated, (req, res) => {
  User.findOne({
    _id: req.user.id
  })
    .then(user => {
      res.render('dashboard/edit');
      user: user
    });
});

//dashboard route
router.get('/', ensureAuthenticated, async (req, res) => {
  //Need to fetch the stripe transactions
  let transactions = await StripeTransaction.find({ $or: [{ sellerId: req.user.id }, { buyerId: req.user.id }] });
  console.log('Stripe Transactions are',transactions);
  //User.findOne({ id: req.user.id })
  const user = req.user;
  // Retrieve the balance from Stripe
  const balance = await stripe.balance.retrieve({
    //const balance = await stripe.balance.retrieve({
    stripe_account: user.stripeAccountId,
  });
  console.log('req.user: ' + req.user)
  console.log('stripeAccountId' + req.user.stripeAccountId)
  console.log('balance: ' + balance)
  console.log('balance2: ' + balance.available[0].amount)


  res.render('dashboard/dashboard', {
    user: user,
    transactions: transactions,
    balanceAvailable: balance.available[0].amount / 100,
    balancePending: balance.pending[0].amount / 100,
  });
});

//edit form process
router.put('/update/:id', (req, res) => {
  console.log(req.params.id);
  User.findOne({
    _id: req.params.id
  })

    .then(user => {
      //new values
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.companyName = req.body.companyName;
      user.contractUserType = req.body.contractUserType;
      user.instagram = req.body.instagram;
      user.facebook = req.body.facebook;
      user.twitter = req.body.twitter;
      user.website = req.body.website;
      user.soundcloud = req.body.soundcloud;
      user.youtube = req.body.youtube;

      console.log('Company Name' + user.companyName);

      user.save()
      res.redirect(`/dashboard`);
    });
});

module.exports = router;