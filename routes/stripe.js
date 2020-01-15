'use strict';

const config = require('../config/stripe');
//not so sure about this stripe second part of require
// const stripe = require('stripe')('../config.stripe.stripe.secretKey');
const stripe = require('stripe')(config.stripe.secretKey);
const request = require('request-promise-native');
const querystring = require('querystring');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = mongoose.model('proposals');
const user = mongoose.model('users');
const StripeTransaction = mongoose.model('stripeTransaction');
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');


router.get('/stripeTest', (req, res) => {
  res.render('dashboard/stripeTest');
})


// Middleware that requires a logged-in pilot
function pilotRequired(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/pilots/login');
  }
  next();
}

/**
 * GET /pilots/stripe/authorize
 *
 * Redirect to Stripe to set up payments.
 */
router.get('/authorize', ensureAuthenticated, (req, res) => {
  console.log('req url is ', req.header('Referer'));
  req.session.redirectUrl = req.query.referer != null ? req.query.referer : req.header('Referer');

  console.log('headers url is ', req.headers);

  console.log('SESSION REDIRECT URL', req.session.redirectUrl)


  // Generate a random string as `state` to protect from CSRF and include it in the session
  req.session.state = Math.random()
    .toString(36)
    .slice(2);
  // Define the mandatory Stripe parameters: make sure to include our platform's client ID
  let parameters = {
    client_id: config.stripe.clientId,
    state: req.session.state,
  };
  // Optionally, the Express onboarding flow accepts `first_name`, `last_name`, `email`,
  // and `phone` in the query parameters: those form fields will be prefilled
  parameters = Object.assign(parameters, {
    //previous redirect_uri config.publicDomain +
    //redirect_uri: 'localhost:5000/stripe/token',
    redirect_uri:'desolate-sierra-72554.herokuapp.com/stripe/token',
    'stripe_user[business_type]': req.user.type || 'individual',
    'stripe_user[business_name]': req.user.businessName || undefined,
    'stripe_user[first_name]': req.user.firstName || undefined,
    'stripe_user[last_name]': req.user.lastName || undefined,
    'stripe_user[email]': req.user.email || undefined,
    // If we're suggesting this account have the `card_payments` capability,
    // we can pass some additional fields to prefill:
    // 'suggested_capabilities[]': 'card_payments',
    // 'stripe_user[street_address]': req.user.address || undefined,
    // 'stripe_user[city]': req.user.city || undefined,
    // 'stripe_user[zip]': req.user.postalCode || undefined,
    // 'stripe_user[state]': req.user.city || undefined,
    // 'stripe_user[country]': req.user.country || undefined
  });
  console.log('Starting Express flow:', parameters);
  // Redirect to Stripe to start the Express onboarding flow
  console.log('about to redirect to config.stripe.authorizeURI')
  res.redirect(
    config.stripe.authorizeUri + '?' + querystring.stringify(parameters)
  );
});

/**
 * GET /pilots/stripe/token
 *
 * Connect the new Stripe account to the platform account.
 */
router.get('/token', ensureAuthenticated, async (req, res, next) => {
  // Check the `state` we got back equals the one we generated before proceeding (to protect from CSRF)
  console.log('hey we made it to /token')
  if (req.session.state != req.query.state) {
    return res.render('req.session.state != req.query.state');
  }
  try {
    // Post the authorization code to Stripe to complete the Express onboarding flow
    const expressAuthorized = await request.post({
      uri: config.stripe.tokenUri,
      form: {
        grant_type: 'authorization_code',
        client_id: config.stripe.clientId,
        client_secret: config.stripe.secretKey,
        code: req.query.code
      },
      json: true
    });

    if (expressAuthorized.error) {
      throw (expressAuthorized.error);
    }

    // Update the model and store the Stripe account ID in the datastore:
    // this Stripe account ID will be used to issue payouts to the pilot
    req.user.stripeAccountId = expressAuthorized.stripe_user_id;
    console.log('stripeAccountId' + req.user.stripeAccountId)
    await req.user.save();

    // Redirect to the Rocket Rides dashboard
    //req.flash('showBanner', 'true');
    res.redirect('/stripe/stripeDashboard');
  } catch (err) {
    console.log('The Stripe onboarding process has not succeeded.');
    next(err);
  }
});

// start of This section is currently not getting used I used this when I was going off of rocket rides template
/**
 * GET /pilots/stripe/dashboard
 *
 * Redirect to the pilots' Stripe Express dashboard to view payouts and edit account details.
 */
router.get('/stripeDashboard', ensureAuthenticated, async (req, res) => {
  //i believe this is where I am leaving off i successfully got here but then it didn't like my api key
  console.log('made it to stripe/stripeDashboard')
  req.session.redirectUrl = req.query.loggedIn != null ? req.header('Referer') : req.session.redirectUrl;
  const user = req.user;
  // Make sure the logged-in pilot completed the Express onboarding
  if (!user.stripeAccountId) {
    console.log('!user.stripeAccountId')
    console.log(user)
    return res.redirect('/dashboard');
  }
  try {
    // Generate a unique login link for the associated Stripe account to access their Express dashboard
    console.log('attempting to loginLink')
    console.log('stripe ' + stripe)
    console.log('user.stripeAccountId' + user.stripeAccountId);
    console.log('stripeClientId ' + config.stripe.clientId)
    const loginLink = await stripe.accounts.createLoginLink(
      user.stripeAccountId, {
        //was pilots/dashboard
        //i want this to take me to stripeDashboard
        //redirect_url: req.session.redirectUrl ? req.session.redirectUrl : 'http://localhost:5000/dashboard'
        redirect_url: req.session.redirectUrl ? req.session.redirectUrl : 'https://desolate-sierra-72554.herokuapp.com/dashboard'
      }
    );
    // Directly link to the account tab
    console.log('req.query.account')
    if (req.query.account) {
      loginLink.url = loginLink.url + '/dashboard';
    }
    // Retrieve the URL from the response and redirect the user to Stripe
    console.log('Stripe login link is', loginLink.url)
    return res.redirect(loginLink.url);
  } catch (err) {
    console.log(err);
    console.log('Failed to create a Stripe login link.');
    return res.redirect('/pilots/signup');
  }
});

// /**
//  * POST /pilots/stripe/payout
//  *
//  * Generate an instant payout with Stripe for the available balance.
//  */
// router.post('/payout', ensureAuthenticated, async (req, res) => {
//   const pilot = req.user;
//   try {
//     // Fetch the account balance to determine the available funds
//     const balance = await stripe.balance.retrieve({
//       stripe_account: pilot.stripeAccountId,
//     });
//     // This demo app only uses USD so we'll just use the first available balance
//     // (Note: there is one balance for each currency used in your application)
//     const {amount, currency} = balance.available[0];
//     // Create an instant payout
//     const payout = await stripe.payouts.create(
//       {
//         amount: amount,
//         currency: currency,
//         statement_descriptor: config.appName,
//       },
//       {
//         stripe_account: pilot.stripeAccountId,
//       }
//     );
//   } catch (err) {
//     console.log(err);
//   }
//   res.redirect('/pilots/dashboard');
// });


// //generate a payment
// router.post('/stripeTransaction', ensureAuthenticated, async (req, res, next) => {
//   console.log('reached stripeTransaction');
//   // const sender = req.user;
//   // // Find a random passenger
//   // const sender = await Sender.getRandom();
//   // Create a new ride for the pilot and this random passenger
//   console.log('receiver: ' + req.body.receiver);
//   console.log('sender: '+ req.user.id);
//   console.log('amount: '+ req.body.amount);
//   let newStripeTransaction = new stripeTransaction({
//     receiver: req.body.receiver,
//     sender: req.user.id,
//     // Generate a random amount between $10 and $100 for this ride
//     amount: req.body.amount
//   });
//   console.log('made it through newStripeTransaction')
//   // Save the ride
//   await stripeTransaction(newStripeTransaction).save();
//   try {
//     // Get a test source, using the given testing behavior
//     let source;
//     if (req.body.immediate_balance) {
//       source = getTestSource('immediate_balance');
//     } else if (req.body.payout_limit) {
//       source = getTestSource('payout_limit');
//     }
//     // Create a charge and set its destination to the pilot's account
//     const charge = await stripe.charges.create({
//       source: source,
//       amount: stripeTransaction.amount,
//       currency: stripeTransaction.currency,
//       description: config.appName,
//       statement_descriptor: config.appName,
//       // The destination parameter directs the transfer of funds from platform to pilot
//       transfer_data: {
//         // Send the amount for the pilot after collecting a 20% platform fee:
//         // the `amountForPilot` method simply computes `ride.amount * 0.8`
//         amount: stripeTransaction.amount,
//         // The destination of this charge is the pilot's Stripe account
//         destination: receiver.stripeAccountId,
//       },
//     });
//     console.log('made it through charge')
//     // Add the Stripe charge reference to the ride and save it
//     stripeTransaction.stripeChargeId = charge.id;
//     stripeTransaction.save();
//   } catch (err) {
//     console.log(err);
//     // Return a 402 Payment Required error code
//     res.sendStatus(402);
//     next(`Error adding token to customer: ${err.message}`);
//   }
//   res.redirect('/pilots/dashboard');
// });
// end of rocket rides template

//the start of payment authentication using Fiverr Strategy
//const processingPercentage = .1;

// ps we are no longer using this route the show route contains this logic
router.get('/checkout/single_proposal/:id', (req, res, next) => {
  console.log('checkout/single_proposal/:id')
  Proposal.findOne({ _id: req.params.id }, function (err, proposal) {
    //console.log('proposal.price: ' + proposal.price)
    try {
      //var price = proposal.price
      var price = proposal.price
      if(price < 5) {
        var fee = 1
      } else {
        var feePercent = .2
        var fee = price*feePercent
      }

      //var fee = Math.ceil(price * feePercent)
      var totalPrice = price + fee;
      console.log('%fee: ' + fee)
      console.log('%price: ' + price)
      console.log('%totalPrice: ' + totalPrice)
      //proposal = proposal;
      //proposal.price = totalPrice;
      req.session.proposal = proposal;
      req.session.fee = fee;
      //req.session.price = price;
      req.session.price = totalPrice;
      console.log('proposal1: ' + req.session.proposal)
      console.log('price: ' + req.session.price)
      res.render('checkout/single_proposal', {
        proposal: proposal,
        fee: fee,
        //price: price,
        totalPrice: totalPrice


      })
    } catch (e) {
      console.log(e)
      //we are currently hitting this because price is undefined???
      console.log('something went wrong');
    }
  });
});


router.route('/payment/:id')
  .get((req, res, next) => {
    Proposal.findOne({
      _id: req.params.id
    })
    res.render('checkout/payment');
    console.log('.get /checkout/payment')
  })

//we added application_fee_amount: fee and i'm not sure if it still sends a payment?
router.post('/payment', async (req, res, next) => {
  console.log('.post /checkout/payment')
  // Create a new customer and then a new charge for that customer:
  var proposal = req.session.proposal
  var price = req.session.price
  var fee = req.session.fee
  //console.log('payment proposal:' + JSON.stringify(proposal))

  price *= 100
  fee *= 100


  var amountSellerReceived = price - fee;

  console.log('seller strip acc id', proposal.sellerStripeAccountId)
  //we want the user information based on the seller stripe account
  let sellerInformation = await user.findOne({ stripeAccountId: proposal.sellerStripeAccountId });
  console.log('SellerInfo', sellerInformation)

  let newStripeTransaction = {
    buyerId: req.user.id,
    buyerFirstName: req.user.firstName,
    buyerLastName: req.user.lastName,
    //the account linked to the proposal.sellerStripeAccountId
    sellerId: sellerInformation._id,
    sellerFirstName: sellerInformation.firstName,
    sellerLastName: sellerInformation.lastName,
    proposalId: proposal._id,
    amountBuyerPaid: price / 100,
    amountSellerReceived: amountSellerReceived / 100
    //stripePaymentIntentId: ???
  }
  // Save the ride
  new StripeTransaction(newStripeTransaction)
    .save();

  stripe.customers
    .create({
      email: req.user.email,
    })
    .then((customer) => {
      console.log('customer2')
      return stripe.customers.createSource(customer.id, {
        source: req.body.stripeToken
      });
    })
    .then((source) => {
      try {
        console.log('source')
        //return stripe.charges.create({
        stripe.charges.create({
          amount: price,
          currency: 'usd',
          customer: source.customer,

          //source: req.body.stripeToken,
          transfer_data: {
            amount: price - fee,
            // destination: req.user.stripeAccountId
            destination: proposal.sellerStripeAccountId
          },

        });
      } catch (e) {
        console.error(e.name + ': ' + e.message);
      }

    })
    .then(async (charge) => {
      console.log('charge')
      console.log('%bprice: ' + price)
      //At this point we need to update the proposal payment status
      try {
        let updatedProposal = await Proposal.findByIdAndUpdate(proposal._id, {
          paidStatus: "paid",
          status: "Paid"
        });
      } catch (err) {
        console.log('getting error inpdating the proposal', err)

      }

      console.log('paid')
      // New charge created on a new customer
      //place at end of put
      res.redirect(`/proposals/show/${proposal._id}`);
    })
    .catch((err) => {
      // Deal with an error
    })

  // .then((paid)=> {
  //   console.log('made it through charge')
  //     Proposal.findOne({
  //       _id: req.params.id
  //     })
  //     console.log('made it through proposal.findOne payment.put')
  //     console.log('proposal2: ' + req.session.proposal )
  //     console.log('proposal3' + proposal)

  //     proposal((req, res) => {
  //       proposal.paidStatus = "paid";

  //       proposal.save()
  //       console.log('maid it through proposal.save')
  //       .then(proposal => {
  //         res.redirect('/');
  //       });
  //     })
  // })
})

router.post('/charge', async (req, res, next) => {
  console.log('CHARGE .post /checkout/charge')
  // Create a new customer and then a new charge for that customer:
  var proposal = req.session.proposal
  var price = req.session.price
  var fee = req.session.fee
  //console.log('payment proposal:' + JSON.stringify(proposal))
  price *= 100
  fee *= 100
  var amountSellerReceived = price - fee;

  console.log('charge variables')
  const buyerId = req.user.id
  const buyerFirstName = req.user.firstName
  const buyerLastName = req.user.lastName
  //the account linked to the proposal.sellerStripeAccountId

  const proposalId = proposal._id
  const amountBuyerPaid = price / 100
  let stripeId
  let stripeReceiptUrl


  var amountSellerReceived = price - fee;
  //beginning of finding the user that touched the proposal
  try {
    let customer = await stripe.customers
      .create({
        email: req.user.email,
      });
    let source = await stripe.customers.createSource(customer.id, {
      source: req.body.stripeToken
    });
    console.log('customer is this', customer.id)
    console.log('source is this', source)
    let stripeCharge = await stripe.charges.create({
      amount: price,
      currency: 'usd',
      customer: source.customer,

      transfer_data: {
        amount: price - fee,
        destination: proposal.sellerStripeAccountId
      }
    })

      let sellerInformation = await user.findOne({ stripeAccountId: proposal.sellerStripeAccountId });
      console.log('SellerInfo', sellerInformation)
      console.log('sellerId' + sellerInformation._id)
      console.log('sellerFirstName' + sellerInformation.firstName)
      console.log('sellerLastName' + sellerInformation.lastName)
      console.log('sellerInformationCharge = ""' + sellerInformation)

      stripeId = stripeCharge.id;
      console.log('stripeID is this', stripeId);
      stripeReceiptUrl = stripeCharge.receipt_url;

      let newStripeTransaction = {
        buyerId: buyerId,
        buyerFirstName: buyerFirstName,
        buyerLastName: buyerLastName,
        sellerId: sellerInformation._id,
        sellerFirstName: sellerInformation.firstName,
        sellerLastName: sellerInformation.lastName,
        proposalId: proposalId,
        amountBuyerPaid: amountBuyerPaid,
        amountSellerReceived: amountSellerReceived / 100,
        stripeId: stripeId,
        stripeReceiptUrl: stripeReceiptUrl,

      }
      // Save the ride
      new StripeTransaction(newStripeTransaction)
        .save();
      console.log('newStripeTransaction: ' + newStripeTransaction)
    
    console.log('charge made it through sending data to db')
    res.redirect(`/proposals/show/${proposal._id}`);
  } catch (err) {
    console.log('catched err is this', err)

  }
})




module.exports = router;
