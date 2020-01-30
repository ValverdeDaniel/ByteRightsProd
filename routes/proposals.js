const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Proposal = mongoose.model('proposals');
const Offer = mongoose.model('offers');
const user = mongoose.model('users');
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');
const { ensureLoggedIn } = require('connect-ensure-login');
const axios = require('axios');
const request = require('request-promise');
const { getMetadata } = require('page-metadata-parser');
const domino = require('domino');



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
router.get('/show/:id', async (req, res) => {
  Proposal.findOne({ _id: req.params.id })

    .populate('user')
    .populate('votes.voteUser')
    .populate('comments.commentUser')
    .populate('touchedBy.touchedByUser')
    .then(proposal => {
     
     
     
    try {
      var price = proposal.price
      var feePercent = .2
      var rawfee = price*feePercent
      var buyerFee = +rawfee.toFixed(2)
      if(buyerFee < 2) {
        buyerFee = 2
      }
      var sellerFee = buyerFee;
      var fee = sellerFee + buyerFee;
      price = price - sellerFee;
      unRoundedTotalPrice = price + fee;
      var totalPrice = unRoundedTotalPrice.toFixed(2);
      
      // try {
      //   var price = proposal.price
      //   if(price < 10) {
      //     var fee = 1
      //   } else {
      //     var feePercent = .2
      //     var rawfee = price*feePercent
      //     var fee = +rawfee.toFixed(2)
      //   }
      //var totalPrice = price + fee;
        console.log('%fee: ' + fee)
        console.log('%price: ' + price)
        console.log('%totalPrice: ' + totalPrice)
        console.log(proposal);
        req.session.proposal = proposal;
        req.session.fee = fee;
        //req.session.price = price;
        req.session.price = totalPrice;
        console.log('proposal1: ' + req.session.proposal)
        console.log('price: ' + req.session.price)
        //messing with metaTags
        res.locals.metaTags = {
          title: "Byte Rights Proposal from " + proposal.user.firstName,
          description: "Click the link for details.",
          image: proposal.url
        }
        res.render('proposals/show', {
          proposal: proposal,
          fee: fee,
          //price: price,
          totalPrice: totalPrice,
          price: price,
          sellerFee: sellerFee,
          buyerFee: buyerFee
        });

      } catch {
        console.log(e)
        console.log('somethingWentWrong get tempshow')
      }

    })
})

//show single proposal
router.get('/tempshow/:id', (req, res) => {
  Proposal.findOne({ _id: req.params.id })

    .populate('user')
    .populate('votes.voteUser')
    .populate('comments.commentUser')
    .populate('touchedBy.touchedByUser')
    .then(proposal => {
      try {
        var price = proposal.price
        var feePercent = .1
        var fee = Math.ceil(price * feePercent)
        var totalPrice = price + fee;
        console.log('%fee: ' + fee)
        console.log('%price: ' + price)
        console.log('%totalPrice: ' + totalPrice)
        console.log(proposal);
        req.session.proposal = proposal;
        req.session.fee = fee;
        //req.session.price = price;
        req.session.price = totalPrice;
        console.log('proposal1: ' + req.session.proposal)
        console.log('price: ' + req.session.price)
        //messing with metaTags
        res.locals.metaTags = {
          title: "Byte Rights Proposal from " + proposal.user.firstName,
          description: "Click the link for details.",
          image: proposal.url
        }
        res.render('proposals/tempshow', {
          proposal: proposal,
          fee: fee,
          //price: price,
          totalPrice: totalPrice
        });

      } catch {
        console.log(e)
        console.log('somethingWentWrong get tempshow')
      }

    })
})

//show singleSubmission proposal
router.get('/showSubmission/:id', async (req, res) => {
  Proposal.findOne({ _id: req.params.id })

    .populate('user')
    .populate('votes.voteUser')
    // .populate('comments.commentUser')
    // .populate('touchedBy.touchedByUser')
    .then(proposal => {
     
     
     
    try {

        //messing with metaTags
        res.locals.metaTags = {
          title: "Byte Rights Proposal from " + proposal.user.firstName,
          description: "Click the link for details.",
          image: proposal.url
        }
        res.render('proposals/showSubmission', {
          proposal: proposal,
        });

      } catch {
        console.log(e)
        console.log('somethingWentWrong with get showSubmission')
      }

    })
})
// show single proposal for guest OG ensureLoggedin /auth/google
router.get('/showClient/:id', ensureLoggedIn('/auth/google'), (req, res) => {
  Proposal.findOne({ _id: req.params.id })

    .populate('user')
    .populate('votes.voteUser')
    .populate('comments.commentUser')
    .populate('touchedBy.touchedByUser')
    .then(proposal => {
     
     
     
    try {
      var price = proposal.price
      var feePercent = .2
      var rawfee = price*feePercent
      var buyerFee = +rawfee.toFixed(2)
      if(buyerFee < 2) {
        buyerFee = 2
      }
      var sellerFee = buyerFee;
      var fee = sellerFee + buyerFee;
      price = price - sellerFee;
      unRoundedTotalPrice = price + fee;
      var totalPrice = unRoundedTotalPrice.toFixed(2);
      
      // try {
      //   var price = proposal.price
      //   if(price < 10) {
      //     var fee = 1
      //   } else {
      //     var feePercent = .2
      //     var rawfee = price*feePercent
      //     var fee = +rawfee.toFixed(2)
      //   }
      //var totalPrice = price + fee;
        console.log('%fee: ' + fee)
        console.log('%price: ' + price)
        console.log('%totalPrice: ' + totalPrice)
        console.log(proposal);
        req.session.proposal = proposal;
        req.session.fee = fee;
        //req.session.price = price;
        req.session.price = totalPrice;
        console.log('proposal1: ' + req.session.proposal)
        console.log('price: ' + req.session.price)
        //messing with metaTags
        res.locals.metaTags = {
          title: "Byte Rights Proposal from " + proposal.user.firstName,
          description: "Click the link for details.",
          image: proposal.url
        }
        res.render('proposals/show', {
          proposal: proposal,
          fee: fee,
          //price: price,
          totalPrice: totalPrice,
          price: price,
          sellerFee: sellerFee,
          buyerFee: buyerFee
        });

      } catch {
        console.log(e)
        console.log('somethingWentWrong get tempshow')
      }

    })
})


//testing if function for ensureLoggedIn
router.get('/showFBClient/:id', ensureLoggedIn('/auth/facebook'), (req, res) => {
  Proposal.findOne({ _id: req.params.id })

    .populate('user')
    .populate('votes.voteUser')
    .populate('comments.commentUser')
    .populate('touchedBy.touchedByUser')
    .then(proposal => {
     
     
     
    try {
      var price = proposal.price
      var feePercent = .2
      var rawfee = price*feePercent
      var buyerFee = +rawfee.toFixed(2)
      if(buyerFee < 2) {
        buyerFee = 2
      }
      var sellerFee = buyerFee;
      var fee = sellerFee + buyerFee;
      price = price - sellerFee;
      unRoundedTotalPrice = price + fee;
      var totalPrice = unRoundedTotalPrice.toFixed(2);
      
      // try {
      //   var price = proposal.price
      //   if(price < 10) {
      //     var fee = 1
      //   } else {
      //     var feePercent = .2
      //     var rawfee = price*feePercent
      //     var fee = +rawfee.toFixed(2)
      //   }
      //var totalPrice = price + fee;
        console.log('%fee: ' + fee)
        console.log('%price: ' + price)
        console.log('%totalPrice: ' + totalPrice)
        console.log(proposal);
        req.session.proposal = proposal;
        req.session.fee = fee;
        //req.session.price = price;
        req.session.price = totalPrice;
        console.log('proposal1: ' + req.session.proposal)
        console.log('price: ' + req.session.price)
        //messing with metaTags
        res.locals.metaTags = {
          title: "Byte Rights Proposal from " + proposal.user.firstName,
          description: "Click the link for details.",
          image: proposal.url
        }
        res.render('proposals/show', {
          proposal: proposal,
          fee: fee,
          //price: price,
          totalPrice: totalPrice,
          price: price,
          sellerFee: sellerFee,
          buyerFee: buyerFee
        });

      } catch {
        console.log(e)
        console.log('somethingWentWrong get tempshow')
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
// router.get('/user/:userId', (req, res) => {
//   Proposal.find({ user: req.params.userId, status: 'public' })
//     .populate('user')
//     .then(proposals => {
//       res.render('proposals/index', {
//         proposals: proposals
//       });
//     });
// });

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

//Received proposals
router.get('/received', ensureAuthenticated, (req, res) => {
  Proposal.find({ 'touchedBy.touchedByUser': req.user.id, user: { $ne: req.user.id } }, { tag: true })
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
        Proposal.find({ 'touchedBy.touchedByUser': req.user.id, user: { $ne: req.user.id } })
          .populate('user')
          .sort({ date: -1 })
          .then(proposals => {
            res.render('proposals/received', {
              proposals: proposals,
              tags: result
            });
          });
      } else {
        Proposal.find({ 'touchedBy.touchedByUser': req.user.id, user: { $ne: req.user.id } })
          .populate('user')
          .sort({ date: -1 })
          .then(proposals => {
            res.render('proposals/received', {
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

//add Offer Buyer creates offer
router.get('/addOffer', ensureAuthenticated, (req, res) => {
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
      res.render('proposals/addOffer', {
        tags: t
      });
    })
})

//edit proposal form
router.get('/editOffer/:id', ensureAuthenticated, (req, res) => {
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
//edit exchange form customer
router.get('/createSubmission/:id', ensureAuthenticated, (req, res) => {

      let tag
      Proposal.findOne({
        _id: req.params.id
      })
      console.log(JSON.stringify(proposal))
        .then(proposal => {
          console.log('/createSubmission route we made it !')
          // if (proposal.user != req.user.id) {
          //   res.redirect('/proposals/my')
          // } else {
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

            });
            res.render('offers/createSubmission', {
              proposal: proposal,
              tag: tag
            });
          // }
        });

});

//process add proposal
router.post('/', ensureAuthenticated, (req, res) => {
  (async () => {

  let allowComments;
  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }
  let credit;
  if (req.body.credit) {
    credit = true;
  } else {
    credit = false;
  }
  let url = req.body.url;
  let n = url.indexOf('?');
  url = url.substring(0, n != -1 ? n : url.length);

  // / Create the base function to be ran /
  let igUsername;  
  try {
      let html = await request(url);
      const doc = domino.createWindow(html).document;
      const metadata = getMetadata(doc, url);
      if (metadata != null && metadata.description != null) {
        igUsername=metadata.description.match(/\(([^)]+)\)/)[1];
        console.log('metadata is', metadata.description.match(/\(([^)]+)\)/)[1]);
        console.log(igUsername);
      } else {
        console.log('either metadata is undefined or it does not contains the description name')
      }
      debugger;
  } catch {
       console.log('something went wrong with the scraper probably that multiphoto for private user scenario')
  }
  
   
  console.log('2' + igUsername)
  let newProposal = {
    url: url,
    contractUserType: req.body.contractUserType,
    recipient: req.body.recipient,
    compensation: req.body.compensation,
    price: req.body.price,
    usage: req.body.usage,
    credit: credit,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id,
    igUsername: igUsername
  }

  if (req.body.contractUserType == "Seller") {
    newProposal.sellerStripeAccountId = req.user.stripeAccountId
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

  })()
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
      let credit;
      if (req.body.credit) {
        credit = true;
      } else {
        credit = false;
      }

      var url = req.body.url;
      var n = url.indexOf('?');
      url = url.substring(0, n != -1 ? n : url.length);

      //new values
      proposal.url = url;
      proposal.contractUserType = req.body.contractUserType;
      proposal.recipient = req.body.recipient;
      proposal.compensation = req.body.compensation;
      proposal.price = req.body.price;
      proposal.usage = req.body.usage;
      proposal.credit = credit;
      proposal.status = req.body.status;
      proposal.allowComments = allowComments;

      if (req.body.contractUserType == "Seller") {
        proposal.sellerStripeAccountId = req.user.stripeAccountId
      }

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
//process add offer submit
router.post('/addOffer/new', ensureAuthenticated, (req, res) => {
  (async () => {

  // let allowComments;
  // if (req.body.allowComments) {
  //   allowComments = true;
  // } else {
  //   allowComments = false;
  // }
  let approvalNeeded;
  if (req.body.approvalNeeded) {
    approvalNeeded = true;
  } else {
    approvalNeeded = false;
  }
  let credit;
  if (req.body.credit) {
    credit = true;
  } else {
    credit = false;
  }
  let offerLink = req.body.offerLink;
  let n = offerLink.indexOf('?');
  offerLink = offerLink.substring(0, n != -1 ? n : offerLink.length);

  let newOffer = {
    offerLink: offerLink,
    compensation: req.body.compensation,
    usage: req.body.usage,
    credit: credit,
    approvalNeeded: approvalNeeded,
    welcomeMessage: req.body.welcomeMessage,
    redemptionInstructions: req.body.redemptionInstructions,
    Type: "Offer",
    //approvalNeeded: approvalNeeded
    //status: req.body.status,
    //allowComments: allowComments,
    user: req.user.id
    //igUsername: igUsername
  }

  let tagIDs = [];
  if (req.body.tags.length > 0) {
    let tagsArr = req.body.tags.split(',');
    tagsArr.forEach(item => {
      tagIDs.push({ text: item.toLowerCase() });
    });

    newOffer.tag = tagIDs;
  }

  // console.log(newOffer;
  // return;

  //create offer
  new Offer(newOffer)
    .save()
    .then(offer => {
      res.redirect(`/proposals/show/${offer.id}`);
    })

  })()
})

//process add offer submit
router.post('/addOffer/new1', ensureAuthenticated, (req, res) => {
  (async () => {

  // let allowComments;
  // if (req.body.allowComments) {
  //   allowComments = true;
  // } else {
  //   allowComments = false;
  // }
  let approvalNeeded;
  if (req.body.approvalNeeded) {
    approvalNeeded = true;
  } else {
    approvalNeeded = false;
  }
  let credit;
  if (req.body.credit) {
    credit = true;
  } else {
    credit = false;
  }
  let offerLink = req.body.offerLink;
  let n = offerLink.indexOf('?');
  offerLink = offerLink.substring(0, n != -1 ? n : offerLink.length);

  let newProposal = {
    offerLink: offerLink,
    compensation: req.body.compensation,
    usage: req.body.usage,
    credit: credit,
    approvalNeeded: approvalNeeded,
    welcomeMessage: req.body.welcomeMessage,
    redemptionInstructions: req.body.redemptionInstructions,
    proposalType: "Offer",
    //approvalNeeded: approvalNeeded
    //status: req.body.status,
    //allowComments: allowComments,
    user: req.user.id
    //igUsername: igUsername
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
      res.redirect(`/offers/createSubmission/${proposal.id}`);
    })

  })()
})

//process add exchange attempt2 proposal customer
router.post('/createSubmission/new', ensureAuthenticated, (req, res) => {
  //console.log('exchange1')
  (async ()=> {
    let credit;
    if (req.body.credit) {
      credit = true;
    } else {
      credit = false;
    }
    console.log('exchange2')

    let url = req.body.url;
    let n = url.indexOf('?');
    url = url.substring(0, n != -1 ? n : url.length);
  
    // / Create the base function to be ran /
    let igUsername;  
    console.log('exchange3')

    try {
        let html = await request(url);
        const doc = domino.createWindow(html).document;
        const metadata = getMetadata(doc, url);
        if (metadata != null && metadata.description != null) {
          igUsername=metadata.description.match(/\(([^)]+)\)/)[1];
          console.log('metadata is', metadata.description.match(/\(([^)]+)\)/)[1]);
          console.log(igUsername);
        } else {
          console.log('either metadata is undefined or it does not contains the description name')
        }
        debugger;
    } catch {
         console.log('something went wrong with the scraper probably that multiphoto for private user scenario')
    }
    console.log('exchange4')

    let newProposal = {
      url: url,
      compensation: req.body.compensation,
      usage: req.body.usage,
      credit: credit,
      user: req.user.id,
      igUsername: igUsername,
      ogOwner: req.body.ogOwner,
      proposalType: "Offer"
    }
    console.log('exchange5')

    new Proposal(newProposal)
      .save()
      .then(proposal => {
        console.log('exchange6')

        res.redirect(`/proposals/showSubmission/${proposal.id}`);
      })
  

  })()
})



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
      const newTouch = {
        touchedByUser: req.user.id
      }
      console.log('In voteUSER');
      console.log('Seller Stripe Account ID', req.user.stripeAccountId)

      if (proposal.contractUserType == "Buyer" && proposal.price != "") {
        proposal.sellerStripeAccountId = req.user.stripeAccountId;
        //See if the seller has account id
        if (!req.user.stripeAccountId || req.user.stripeAccountId == "") {
          //Means user doesnot have stripe account, let's show him the signup page first
         return res.redirect(`/stripe/authorize?referer=${req.header('Referer')}`);
        }
      }
     


      proposal.status = "Accepted";
      // voteBody= req.body.voteBody,
      // voteUser= req.user.id,
      // touchedBy= req.user.id
      // console.log('voteBody1: '+voteBody)
      // console.log('voteUser1: '+voteUser)
      // console.log('touchedByUser1: '+touchedBy)
      //push to votes array
      //unshift adds it to the beginning
      proposal.votes.unshift(newVote);
      proposal.touchedBy.unshift(newTouch);

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
        commentUser: req.user.id,
        touchedBy: req.user.id
      }
      const newTouch = {
        touchedByUser: req.user.id
      }

      //push to comments array
      //unshift adds it to the beginning
      proposal.comments.unshift(newComment);
      proposal.touchedBy.unshift(newTouch);

      proposal.save()
        .then(proposal => {
          res.redirect(`/proposals/show/${proposal.id}`);
        })
    });
});

//edit proposal to add sellerStripeAccountId process
router.put('/sellerStripeAccountId/:id', (req, res) => {
  Proposal.findOne({
    _id: req.params.id
  })
    .then(proposal => {

      //new values
      proposal.sellerStripeAccountId = req.user.stripeAccountId;

      proposal.save()
        .then(proposal => {
          res.redirect(`/proposals/show/${proposal.id}`);
        });
    });
});

module.exports = router;