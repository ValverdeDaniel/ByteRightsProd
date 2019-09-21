const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = mongoose.model('proposals');
const user = mongoose.model('users');
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');
const { ensureLoggedIn } = require('connect-ensure-login');
const axios = require('axios');


// proposals index (all public proposals route) 
// router.get('/', (req, res) => {
//   Proposal.find({status: 'public'})
//     .populate('user')
//     .sort({date:'desc'})
//     .then(proposals => {
//       res.render('proposals/index', {
//         proposals: proposals
//       });
//     });

// })

router.post('/filter', (req, res) => {
  console.log(JSON.parse(req.body.data));
  let data = [];
  JSON.parse(req.body.data).forEach(item => {
    console.log(item);
    var r = new RegExp(item, 'i');
    data.push(r);
    console.log(r);
  })

  // Proposal.find({ user: req.user.id })

  Proposal.find({ user: req.user.id, tag: { $elemMatch: { text: { "$in": data } } } })
    .populate('user')
    .then(proposal => {
      res.json(proposal);
    })
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
      console.log(proposal);
      if (proposal.status == 'public') {
        //messing with metaTags
        res.locals.metaTags = { 
          title: "Byte Rights Proposal from " + proposal.FirstName, 
          description: "Click the link for details.",   
          image: proposal.url 
         } 
        res.render('proposals/show', {
          proposal: proposal
        });

      } else {
        if (req.user) {
          if (req.user.id == proposal.user._id) {
            res.render('proposals/show', {
              proposal: proposal
            });
          } else {
            res.redirect('/proposals/my');
          }
        } else {
          res.redirect('/proposals/my');
        }
      }
    })
})

// show single proposal for guest OG ensureLoggedin /auth/google
router.get('/showClient/:id', ensureLoggedIn('/auth/google'), (req, res) => {
  Proposal.findOne({
    _id: req.params.id
  })
    .populate('user')
    .populate('votes.voteUser')
    .populate('comments.commentUser')
    .then(proposal => {
      if (proposal.status == 'public') {
        res.render('proposals/showClient', {
          proposal: proposal
        });

      } else {
        if (req.user) {
          if (req.user.id == proposal.user._id) {
            res.render('proposals/showClient', {
              proposal: proposal
            });
          } else {
            res.redirect('/proposals/my');
          }
        } else {
          res.redirect('/proposals/my');
        }
      }
    })
})

//testing if function for ensureLoggedIn
router.get('/showFBClient/:id', ensureLoggedIn('/auth/facebook'), (req, res) => {
  Proposal.findOne({
    _id: req.params.id
  })
    .populate('user')
    .populate('votes.voteUser')
    .populate('comments.commentUser')
    .then(proposal => {
      if(proposal.status == 'public') {
        res.render('proposals/showClient', {
          proposal:proposal
        });

      } else {
        if(req.user){
          if(req.user.id == proposal.user._id){
            res.render('proposals/showClient', {
              proposal:proposal
            });
          } else {
            res.redirect('/proposals/my');
          }
        } else {
          res.redirect('/proposals/my');
        }
      }
    })
})

//display terms per proposal
router.get('/terms/:id', (req, res) => {
  Proposal.findOne({
    _id: req.params.id
  })
    .populate('user')
    .populate('votes.voteUser')
    .populate('comments.commentUser')
    .then(proposal => {
      res.render('proposals/terms', {
        proposal: proposal
      });
    })
});


//list proposals from a user
router.get('/user/:userId', (req, res) => {
  Proposal.find({ user: req.params.userId, status: 'public' })
    .populate('user')
    .then(proposals => {
      res.render('proposals/index', {
        proposals: proposals
      });
    });
});

//logged in Users proposals
router.get('/my', ensureAuthenticated, (req, res) => {
  Proposal.find({ user: req.user.id }, { tag: true })
    .then(p => {
      console.log(p);
      let tags = [];
      if (p.length > 0) {
        p.forEach(proposal => {
          if (proposal.tag.length > 0) {
            proposal.tag.forEach(item => {
              tags.push(item.text.toLowerCase());
            })
          }
        })
      }

      console.log(tags);

      let result = [];
      let map = new Map();
      for (let item of tags) {
        if (!map.has(item)) {
          map.set(item, true);    // set any value to Map
          result.push(item.toLowerCase());
        }
      }
      console.log(result);

      if (tags.length > 0) {
        Proposal.find({ user: req.user.id })
          .populate('user')
          .sort({ date: -1 })
          .then(proposals => {
            res.render('proposals/index', {
              proposals: proposals,
              tags: result
            });
          });
      } else {
        Proposal.find({ user: req.user.id })
          .populate('user')
          .sort({ date: -1 })
          .then(proposals => {
            res.render('proposals/index', {
              proposals: proposals,
              tags: []
            });
          });
      }
    })
});

router.post('/tags', ensureAuthenticated, (req, res) => {
  Proposal.find({ user: req.user.id }, { tag: true })
    .then(p => {
      let tags = [];
      if (p.length > 0) {
        p.forEach(proposal => {
          if (proposal.tag.length > 0) {
            proposal.tag.forEach(item => {
              tags.push(item.text.toLowerCase());
            })
          }
        })
      }
      let result = [];
      let map = new Map();
      for (let item of tags) {
        if (!map.has(item)) {
          map.set(item, true);    // set any value to Map
          result.push(item.toLowerCase());
        }
      }
      var PATTERN = new RegExp(req.body.keyword, 'i');
      console.log(PATTERN);
      var filtered = result.filter(function (str) { return PATTERN.test(str); });
      res.json((req.body.keyword == "" || req.body.keyword == null) ? [] : filtered);
    })
});

//add proposal form
router.get('/add', ensureAuthenticated, (req, res) => {
  Proposal.find({ user: req.user.id }, { tag: true })
    .then(p => {
      console.log(p);
      let tags = [];
      if (p.length > 0) {
        p.forEach(proposal => {
          if (proposal.tag.length > 0) {
            proposal.tag.forEach(item => {
              tags.push(item.text.toLowerCase());
            })
          }
        })
      }
      let result = [];
      let map = new Map();
      for (let item of tags) {
        if (!map.has(item)) {
          map.set(item, true);    // set any value to Map
          result.push(item.toLowerCase());
        }
      }
      let t = [];
      let count = 0;
      for (var i = result.length; i >= 0; i--) {
        t.push(result[i]);
        if (count > 10) {
          break;
        }
        count++;
      }
      res.render('proposals/add', {
        tags: t
      });
    })
})

//edit proposal form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Proposal.find({ user: req.user.id }, { tag: true })
    .then(p => {
      console.log(p);
      let tags = [];
      if (p.length > 0) {
        p.forEach(proposal => {
          if (proposal.tag.length > 0) {
            proposal.tag.forEach(item => {
              tags.push(item.text.toLowerCase());
            })
          }
        })
      }
      let result = [];
      let map = new Map();
      for (let item of tags) {
        if (!map.has(item)) {
          map.set(item, true);    // set any value to Map
          result.push(item.toLowerCase());
        }
      }
      let t = [];
      let count = 0;
      for (var i = result.length; i >= 0; i--) {
        t.push(result[i]);
        if (count > 10) {
          break;
        }
        count++;
      }

      Proposal.findOne({
        _id: req.params.id
      })
        .then(proposal => {
          let tag = "";
          if (proposal.tag.length > 0) {
            proposal.tag.forEach(item => {
              // console.log(item.text);
              tag = tag + item.text.toLowerCase() + ',';
            })
            tag = tag.slice(0, -1);
          }
          if (proposal.user != req.user.id) {
            res.redirect('/proposals/my')
          } else {
            res.render('proposals/edit', {
              proposal: proposal,
              tag: tag,
              tags: t
            });
          }
        });
    })

});

//process add proposal
router.post('/', ensureAuthenticated, (req, res) => {
  let allowComments;

  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }
  var url = req.body.url;
  var n = url.indexOf('?');
  url = url.substring(0, n != -1 ? n : url.length);

  let newProposal = {
    url: url,
    recipient: req.body.recipient,
    compensation: req.body.compensation,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id
  }

  let tagIDs = [];
  if (req.body.tags.length > 0) {
    let tagsArr = req.body.tags.split(',');
    tagsArr.forEach(item => {
      tagIDs.push({ text: item.toLowerCase() });
    });

    newProposal.tag = tagIDs;
  }

  // console.log(newProposal);
  // return;

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
      if (req.body.allowComments) {
        allowComments = true;
      } else {
        allowComments = false;
      }

      var url = req.body.url;
      var n = url.indexOf('?');
      url = url.substring(0, n != -1 ? n : url.length);

      //new values
      proposal.url = url;
      proposal.recipient = req.body.recipient;
      proposal.compensation = req.body.compensation;
      proposal.status = req.body.status;
      proposal.allowComments = allowComments;

      let tagIDs = [];
      if (req.body.tags.length > 0) {
        let tagsArr = req.body.tags.split(',');
        tagsArr.forEach(item => {
          tagIDs.push({ text: item });
        });

        proposal.tag = tagIDs;
      }

      proposal.save()
        .then(proposal => {
          res.redirect(`/proposals/show/${proposal.id}`);
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
  Proposal.remove({ _id: req.params.id })
    .then(() => {
      res.redirect('/proposals/my');
    })
});

//add user vote
router.post('/voteUser/:id', (req, res) => {
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

//add guest vote
router.post('/voteGuest/:id', (req, res) => {
  Proposal.findOne({
    _id: req.params.id
  })
    .then(proposal => {
      const newVote = {
        voteBody: req.body.voteBody,
        voteEmail: req.body.voteEmail
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