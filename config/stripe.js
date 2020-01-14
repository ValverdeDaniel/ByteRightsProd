'use strict';

module.exports = {
  // App name
  // appName: 'Rocket Rides',

  // // Public domain of Rocket Rides
  // publicDomain: 'http://localhost:3000',

  // // Server port
  // port: 3000,

  // // Secret for cookie sessions
  // secret: 'YOUR_SECRET',

  // Configuration for Stripe
  // API Keys: https://dashboard.stripe.com/account/apikeys
  // Connect Settings: https://dashboard.stripe.com/account/applications/settings
  //test keys
  // stripe: {
  //   secretKey: 'sk_test_tF2ATjx0ybAcarTgqn0zpqbr005vSTX7PO',
  //   publishableKey: 'pk_test_ggUprAz0qNKTol6UXU7bRtLu003bsXsePv',
  //   clientId: 'ca_FtuG5UUMgotba2yf8gH1C6yQSnpr4pq1',
  //   authorizeUri: 'https://connect.stripe.com/express/oauth/authorize',
  //   tokenUri: 'https://connect.stripe.com/oauth/token'
  // },

  //live keys
  stripe: {
    secretKey: 'sk_live_JDOuKnfK5EEsIjTxbpPer3dx00PaXr0hOs',
    publishableKey: 'pk_live_PCXOaN7ilwRLSmzgninvaqp000yhPs2Se1',
    clientId: 'ca_FtuGniH7a1hLRU0AnPkrYlFuh9vHMjuG',
    authorizeUri: 'https://connect.stripe.com/express/oauth/authorize',
    tokenUri: 'https://connect.stripe.com/oauth/token'
  },
  // // Configuration for MongoDB
  // mongoUri: 'mongodb://localhost/rocketrides',

  // // Configuration for Google Cloud (only useful if you want to deploy to GCP)
  // gcloud: {
  //   projectId: 'YOUR_PROJECT_ID'
  // }
};
