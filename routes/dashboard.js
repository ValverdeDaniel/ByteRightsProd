const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = mongoose.model('proposals');
const User = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

router.get('/edit', ensureAuthenticated, (req, res) => {
    User.findOne({
        _id: req.user.id
      })
    .then(user => {
        res.render('dashboard/edit');
        user:user
    });
});

router.get('/', ensureAuthenticated, (req, res) => {
    User.findOne({id:req.user.id})
      res.render('dashboard/dashboard');
});

//edit form process
router.put('/update/:id', (req, res) => {
    console.log(req.params.id);
    User.findOne({
      _id: req.params.id
    })

    .then(user => {
      //new values
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.companyName = req.body.companyName;
      user.instagram = req.body.instagram;
      user.facebook = req.body.facebook;
      user.twitter = req.body.twitter;
      user.website = req.body.website;
      user.soundcloud = req.body.soundcloud;
      user.youtube = req.body.youtube;

      console.log('Company Name'+ user.companyName);
  
      user.save()
        res.redirect(`/dashboard`);
    });
  });

module.exports = router;