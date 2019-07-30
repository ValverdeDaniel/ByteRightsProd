const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    // Successful authentication, redirect dashboard.
    res.redirect('/dashboard');
  });

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



//within the google passport.authenticate after instagram, they have scope {"profile", "email"}
router.get('/instagram', passport.authenticate('instagram'))

router.get('/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/' }),(req, res) => {
    res.redirect('/dashboard');
  });

module.exports = router;
