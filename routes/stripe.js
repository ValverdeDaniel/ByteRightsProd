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
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');


router.get('/stripeTest', (req, res) => {
  res.send('stripeTest');
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
    redirect_uri:  'localhost:5000/stripe/token',
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
      throw(expressAuthorized.error);
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

/**
 * GET /pilots/stripe/dashboard
 *
 * Redirect to the pilots' Stripe Express dashboard to view payouts and edit account details.
 */
router.get('/stripeDashboard', ensureAuthenticated, async (req, res) => {
  //i believe this is where I am leaving off i successfully got here but then it didn't like my api key
  console.log('made it to stripe/stripeDashboard')
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
        redirect_url: 'http://localhost:5000/dashboard'
      }
    );
    // Directly link to the account tab
    console.log('req.query.account')
    if (req.query.account) {
      loginLink.url = loginLink.url + '/dashboard';
    }
    // Retrieve the URL from the response and redirect the user to Stripe
    return res.redirect(loginLink.url);
  } catch (err) {
    console.log(err);
    console.log('Failed to create a Stripe login link.');
    return res.redirect('/pilots/signup');
  }
});

/**
 * POST /pilots/stripe/payout
 *
 * Generate an instant payout with Stripe for the available balance.
 */
router.post('/payout', ensureAuthenticated, async (req, res) => {
  const pilot = req.user;
  try {
    // Fetch the account balance to determine the available funds
    const balance = await stripe.balance.retrieve({
      stripe_account: pilot.stripeAccountId,
    });
    // This demo app only uses USD so we'll just use the first available balance
    // (Note: there is one balance for each currency used in your application)
    const {amount, currency} = balance.available[0];
    // Create an instant payout
    const payout = await stripe.payouts.create(
      {
        amount: amount,
        currency: currency,
        statement_descriptor: config.appName,
      },
      {
        stripe_account: pilot.stripeAccountId,
      }
    );
  } catch (err) {
    console.log(err);
  }
  res.redirect('/pilots/dashboard');
});

module.exports = router;
