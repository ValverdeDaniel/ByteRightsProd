const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = mongoose.model('proposals');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

router.get('/', ensureGuest, (req, res) => {
  res.render('index/welcome');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  Proposal.find({user:req.user.id})
  .then(proposals => {
    res.render('index/dashboard', {
      proposals: proposals
    });  
  })
  
});

router.get('/about', (req, res) => {
  res.render('index/about');
});

module.exports = router;