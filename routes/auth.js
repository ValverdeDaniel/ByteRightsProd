const express = require('express');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    // Successful authentication, redirect dashboard.
    res.redirect('/dashboard');
  });

//passport-instagram routes
//within the google passport.authenticate after instagram, they have scope {"profile", "email"}
router.get('/instagram', passport.authenticate('instagram'))

// router.get('/instagram/callback', 
//   passport.authenticate('instagram', { failureRedirect: '/' }),(req, res) => {
//     console.log(req);
//     res.redirect('/dashboard');
//   });

router.get('/instagram/callback', (req, res) => {
  console.log(req.query);
  const { code } = req.query;

  if (code) {
    axios.post('https://api.instagram.com/oauth/access_token', {
      client_id: '490d52f3cbf042d0aa4186491f5e7d5d',
      client_secret: '8c68ca63c4ee48f6ad5fba0fecef6851',
      grant_type: 'authorization_code',
      redirect_uri: 'localhost:5000/auth/callback',
      code
    }).then(response => {
      console.log(response.data);
    }).catch(error => console.log(error.response.data));
  }
});

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
