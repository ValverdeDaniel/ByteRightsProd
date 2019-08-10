const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = mongoose.model('proposals');
const user = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');
const axios = require('axios');


// proposals index
router.get('/', (req, res) => {
  Proposal.find({status: 'public'})
    .populate('user')
    .sort({date:'desc'})
    .then(proposals => {
      res.render('proposals/index', {
        proposals: proposals
      });
    });
  
})

//show single proposal
router.get('/show/:id', (req, res) => {
  Proposal.findOne({
    _id: req.params.id
  })
    .populate('user')
    .populate('votes.voteUser')
    .populate('comments.commentUser')
    .then(proposal => {
      if(proposal.status == 'public') {
        res.render('proposals/show', {
          proposal:proposal
        });

      } else {
        if(req.user){
          if(req.user.id == proposal.user._id){
            res.render('proposals/show', {
              proposal:proposal
            });
          } else {
            res.redirect('/proposals');
          }
        } else {
          res.redirect('/proposals');
        }
      }
    })
})

//list proposals from a user
router.get('/user/:userId', (req, res) => {
  Proposal.find({user: req.params.userId, status: 'public'})
    .populate('user')
    .then(proposals => {
      res.render('proposals/index', {
        proposals: proposals
      });
    });
});

//logged in Users proposals
router.get('/my', ensureAuthenticated, (req, res) => {
  Proposal.find({user: req.user.id})
    .populate('user')
    .then(proposals => {
      res.render('proposals/index', {
        proposals: proposals
      });
    });
});


//add proposal form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('proposals/add');
})

//edit proposal form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Proposal.findOne({
    _id: req.params.id
  })
    .then(proposal => {
      if(proposal.user != req.user.id){
        res.redirect('/proposals')
      } else {
        res.render('proposals/edit', {
          proposal: proposal
        });
      }
    });
});

//process add proposal
router.post('/', (req, res) => {
  let allowComments;

  if(req.body.allowComments){
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newProposal = {
    url: req.body.url,
    compensation: req.body.compensation,
    status: req.body.status,
    allowCcomments: allowComments,
    user: req.user.id
  }

  //create proposal
  new Proposal(newProposal)
    .save()
    .then(proposal => {
      res.redirect(`/proposals/show/${proposal.id}`);
    })
})

//edit form process
router.put('/:id', (req, res) => {
  Proposal.findOne({
    _id: req.params.id
  })
  .then(proposal => {
    let allowComments;
    if(req.body.allowComments){
      allowComments = true;
    } else {
      allowComments = false;
    }

    //new values
    proposal.url = req.body.url;
    proposal.compensation = req.body.compensation;
    proposal.status = req.body.status;
    proposal.allowComments = allowComments;

    proposal.save()
      .then(proposal => {
        res.redirect('/dashboard');
      });
  });
});

//vote on proposal
// router.put('/:id/vote', async (req, res) => {
//   try {
//     const errors = {};
//     let proposal = await Proposal.findOne({ _id: req.params.id })
//     if (!proposal) {
//       throw new Error('Proposal not found');
//     }
//     let votes = proposal.votes || [];
//     let existingVote = votes.find(vote => vote.user.toString() === req.user._id.toString())
//     if (existingVote) {
//       existingVote.userSay = req.body.userSay;
//     } else {
//       votes.push({user: req.user._id, userSay: req.body.userSay});
//     }
//     proposal.votes = votes;
//     await proposal.save();
//     res.json(proposal)
//   } catch (error) {
//     res.status(404).json(error)
//   }
// });

// //add this part to the show proposals part. or something like that.
// export const voteProposal = (id, data) => (dispatch) => {
//   dispatch(setProposalSaving());
//   console.log('voteProposal ', id, data)
//   axios
//     .put(`/api/proposal/${id}/vote`, data)
//     .then(res => dispatch({
//       type: VOTE_CONTRACT,
//       payload: res.data,
//     }))
//     .catch(err => dispatch({
//       type: VOTE_CONTRACT,
//       payload: null,
//     }));
// };

//delete Proposal
router.delete('/:id', (req, res) => {
  Proposal.remove({_id: req.params.id})
    .then(() => {
      res.redirect('/dashboard');
    })
});

//add vote
router.post('/vote/:id', (req, res) => {
  Proposal.findOne({
    _id: req.params.id
  })
  .then(proposal => {
    const newVote = {
      voteBody: req.body.voteBody,
      voteUser: req.user.id
    }

    //push to votes array
    //unshift adds it to the beginning
    proposal.votes.unshift(newVote);

    proposal.save()
      .then(proposal => {
        res.redirect(`/proposals/show/${proposal.id}`);
      })
  });
});

//add comment
router.post('/comment/:id', (req, res) => {
  Proposal.findOne({
    _id: req.params.id
  })
  .then(proposal => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    }

    //push to comments array
    //unshift adds it to the beginning
    proposal.comments.unshift(newComment);

    proposal.save()
      .then(proposal => {
        res.redirect(`/proposals/show/${proposal.id}`);
      })
  });
});

module.exports = router;