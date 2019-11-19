const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = mongoose.model('proposals');
const user = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

router.get('/', ensureGuest, (req, res) => {
  res.render('index/welcome');
});

router.get('/businesses', (req, res) => {
  res.render('index/businesses');
});

router.get('/creatives', (req, res) => {
  res.render('index/creatives');
});


// router.get('/dashboard', ensureAuthenticated, (req, res) => {
//   user.findOne({id:req.user.id})
//     res.render('index/dashboard');
// });

// router.get('/edit', ensureAuthenticated, (req, res) => {
//   res.render('/edit');
// });

router.get('/about', (req, res) => {
  res.render('index/about');
});

router.get('/support', (req, res) => {
  res.render('index/support');
});

router.get('/termsofuse', (req, res) =>{
  res.render('index/termsofuse');
});

router.get('/privacypolicy', (req, res) =>{
  res.render('index/privacypolicy');
});

module.exports = router;