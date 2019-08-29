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

      console.log('Company Name'+ user.companyName);
  
      user.save()
        res.redirect(`/dashboard`);
    });
  });

module.exports = router;