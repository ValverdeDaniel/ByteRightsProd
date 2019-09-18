const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");


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

//passport-local reset

//forgot password
router.get('/forgot', (req, res) => {
  res.render('./local/forgot');
});

router.post('/forgot', (req, res, next) => {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if(!user) {
          req.flash('error_msg', 'No Account with that email address exists.');
          return res.redirect('./forgot');
        }
        
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; //1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'valverdedaniel44@gmail.com',
          pass: ''
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'valverdedaniel44@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/auth/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('./forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired.');
      return res.redirect('./forgot');
    }
    res.render('./local/reset', {token: req.params.token});
  });
});

//https://myaccount.google.com/lesssecureapps
//make sure to make your email less secure lol in order for this to work

//used to have
router.post('/reset', function(req, res) {
  console.log('resetToken1')
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        console.log('resetToken2')
        // if (!user) {
        //   req.flash('error_msg', 'Password reset token is invalid or has expired.');
        //   return res.redirect('back');
        // }
        if(req.body.password === req.body.password2) {
          //trying something new
          const newPassword = new Password({
            password: req.body.password
          })
          // user.password = req.body.password;
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newPassword.password, salt, (err, hash) => {
              if(err) throw err;
              newPassword.password = hash;
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;  
              newPassword.save()
                .then(user => {
                  req.flash('sucess_msg', 'You are now registered and can log in')
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                })
            })
          })
            // user.resetPasswordToken = undefined;
            // user.resetPasswordExpires = undefined;

            // user.save(function(err) {
            //   req.logIn(user, function(err) {
            //     done(err, user);
            //   });
            // });
        } else {
            req.flash("error_msg", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
          user: 'valverdedaniel44@gmail.com',
          pass: ''
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'valverdedaniel44@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success_msg', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/proposals/my');
  });
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
  req.flash('success_msg', 'You are logged Out');
  res.redirect('/');
});


module.exports = router;
