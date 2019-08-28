const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = mongoose.model('proposals');
const User = mongoose.model('users');
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

router.get('/profile', ensureAuthenticated, (req, res) => {
  Proposal.find({user: req.user.id})
    .populate('user')
    .then(proposals => {
      res.render('index/profile', {
        proposals: proposals
      });
    });
});

//update profile form
router.get('/updateProfile', ensureAuthenticated, (req, res) => {
  res.render('index/updateProfile');
})

// router.post('/updateProfile', (req, res) => {
//   User.findOne({
//     _id: req.params.id
//   })
//   .then(user => {

//     //new values
//     user.business = req.body.business;

//     user.save()
//       .then(user => {
//         res.render(`/profile`, {
//           user: user
//         });
//       });
//   });
// });

//got ti working to the point where the only issue was user not defined??
router.post('/updateProfile', (req, res) => {
  console.log('1')
  console.log(req.user.id)
  User.find({
    user: req.user.id
  })
  // let user = {}
  console.log('business: ' + req.body.business)
    .then(user => {
      console.log('2' + req.user.id)
      // email= user.email;
      // firstName= user.firstName;
      // lastName = user.lastName;
      user.business = req.body.business;
      user.save()
      res.redirect('/profile');
    });
});

//12:37
// router.post('/updateProfile', (req, res, next) => {
//   console.log('1')
//   let id = {
//     _id: req.params.id
//   };

//   db.collection("User").update({_id: id}, {$set:{'business': req.body.business}}, (err, result) => {
//     console.log('2')
//     if(err) {
//       throw err;
//     }
//     res.send('user updated sucessfully');
//   });
// });


// //edit proposal form
// router.get('/updateProfile/:id', ensureAuthenticated, (req, res) => {
//   User.findOne({
//     _id: req.params.id
//   })
//     .then(proposal => {
//       if(proposal.user != req.user.id){
//         res.redirect('/proposals/my')
//       } else {
//         res.render('proposals/edit', {
//           proposal: proposal
//         });
//       }
//     });
// });

// //edit form process
// router.put('/:id', (req, res) => {
//   Profile.findOne({
//     _id: req.params.id
//   })
//   .then(profile => {

//     //new values
//     profile.business = req.body.business;

//     profile.save()
//       .then(user => {
//         res.redirect(`/profile`);
//       });
//   });
// });

// //edit form process
// router.put('/updateProfile', (req, res) => {
//   Proposal.findOne({
//     _id: req.params.id
//   })
//   user => {

//     //new values
//     user.business = req.body.business;


//     user.save()
//       .then(user => {
//         res.redirect('/profile');
//       });
//   };
// });

module.exports = router;