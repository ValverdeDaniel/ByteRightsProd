const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = mongoose.model('proposals');
const user = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

router.get('/', ensureGuest, (req, res) => {
  res.render('index/welcome');
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

module.exports = router;