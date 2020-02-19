const express = require('express');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');
const Instagram = require('node-instagram').default;


router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

//OG Google login route
// router.get('/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
//     // Successful authentication, redirect dashboard.
//     res.redirect('/proposals/my');
//   });

//jared hansons connect-ensure-login redirect
router.get('/google/callback', 
  passport.authenticate('google', { successReturnToOrRedirect: '/proposals/my', failureRedirect: '/' })
);

router.get('/facebook', passport.authenticate('facebook', {scope: ['public_profile', 'email']}));

//OG Facebook login route
// router.get('/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
//     // Successful authentication, redirect home.
//     res.redirect('/proposals/my');
//   });

//jared hansons connect-ensure-login redirect
router.get('/facebook/callback', 
  passport.authenticate('facebook', { successReturnToOrRedirect: '/proposals/my', failureRedirect: '/' })
);


// Create a new instance.
const instagram = new Instagram({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  accessToken: 'user-access-token',
});

// Your redirect url where you will handle the code param
const redirectUri = 'http://localhost:3000/auth/instagram/callback';
 
// First redirect user to instagram oauth
app.get('/auth/instagram', (req, res) => {
  res.redirect(
    instagram.getAuthorizationUrl(
      redirectUri,
      {
        // an array of scopes
        scope: ['basic', 'likes'],
      },
      // an optional state
      //(state: 'your state')
    )
  );
});
 
// Handle auth code and get access_token for user
app.get('/auth/instagram/callback', async (req, res) => {
  try {
    // The code from the request, here req.query.code for express
    const code = req.query.code;
    const data = await instagram.authorizeUser(code, redirectUri);
    // data.access_token contain the user access_token
    res.json(data);
  } catch (err) {
    res.json(err);
  }
});

//passport-instagram routes
//within the google passport.authenticate after instagram, they have scope {"profile", "email"}
// router.get('/instagram', passport.authenticate('instagram'))

// router.get('/instagram/callback', 
//   passport.authenticate('instagram', { failureRedirect: '/' }),(req, res) => {
//     console.log(req);
//     res.redirect('/dashboard');
//   });

// router.get('/instagram/callback', (req, res) => {
//   console.log(req.query);
//   const { code } = req.query;

//   if (code) {
//     axios.post('https://api.instagram.com/oauth/access_token', {
//       client_id: '490d52f3cbf042d0aa4186491f5e7d5d',
//       client_secret: '8c68ca63c4ee48f6ad5fba0fecef6851',
//       grant_type: 'authorization_code',
//       redirect_uri: 'localhost:5000/auth/callback',
//       code
//     }).then(response => {
//       console.log(response.data);
//     }).catch(error => console.log(error.response.data));
//   }
// });

//verification routes
router.get('/verify', (req, res) => {
  if(req.user) {
    console.log(req.user);
  } else {
    console.log('not auth');
    res.redirect('/');
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


module.exports = router;
