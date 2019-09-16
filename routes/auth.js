const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');

//load user model
require('../models/User');
const User = mongoose.model('users')

//google passport.authenticate route
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

router.get('/local/login', (req, res) => {
  res.render('./local/login');
});

router.get('/local/register', (req, res) => {
  res.render('./local/register');
});

//local-login form post
router.post('/local/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/proposals/my',
    failureRedirect: './login',
    failureFlash: true
  })(req, res, next);
});


//register form
router.post('/local/register', (req, res) => {
  let errors = [];

  if(req.body.password != req.body.password2){
    errors.push({text: 'Passwords do not match'});
  }
  if(req.body.password.length<4) {
    errors.push({text: 'Password must be at least 4 characters'});
  }
  if(errors.length > 0){
    res.render('local/register', {
      errors: errors,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    User.findOne({email: req.body.email})
      .then(user => {
        if(user) {
          req.flash('error_msg', 'Email is already registered')
          res.redirect('./register')
        } else {
          const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
          });
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if(err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'You are now registered and can log in')
                  res.redirect('./login')
                })
                .catch(err => {
                  console.log(err);
                  return;
                })
            });
          });
        }
      });

  }
})

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
  req.flash('success_msg', 'You are logged Out');
  res.redirect('/');
});


module.exports = router;
