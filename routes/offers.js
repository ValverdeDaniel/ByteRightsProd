const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Offer = mongoose.model('offers');
const user = mongoose.model('users');
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');
const { ensureLoggedIn } = require('connect-ensure-login');
const axios = require('axios');
const request = require('request-promise');
const { getMetadata } = require('page-metadata-parser');
const domino = require('domino');

//add Offer Buyer creates offer
router.get('/addOffer', ensureAuthenticated, (req, res) => {
  console.log('made it to offer/addoffer')
  // Offer.find({ user: req.user.id }, { tag: true })
  //   .then(o => {
  //     console.log(o);
  //     let tags = [];
  //     if (o.length > 0) {
  //       o.forEach(offer  => {
  //         if (offer .tag.length > 0) {
  //           offer .tag.forEach(item => {
  //             tags.push(item.text.toLowerCase());
  //           })
  //         }
  //       })
  //     }
  //     let result = [];
  //     let map = new Map();
  //     for (let item of tags) {
  //       if (!map.has(item)) {
  //         map.set(item, true);    // set any value to Map
  //         result.push(item.toLowerCase());
  //       }
  //     }
  //     let t = [];
  //     let count = 0;
  //     for (var i = result.length; i >= 0; i--) {
  //       t.push(result[i]);
  //       if (count > 10) {
  //         break;
  //       }
  //       count++;
  //     }
      res.render('offers/addOffer', {
        //tags: t
      });
   // })
})

//edit offer form
router.get('/editOffer/:id', ensureAuthenticated, (req, res) => {
  Offer.find({ user: req.user.id }, { tag: true })
    .then(p => {
      console.log(p);
      let tags = [];
      if (p.length > 0) {
        p.forEach(offer => {
          if (offer.tag.length > 0) {
            offer.tag.forEach(item => {
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

      Offer.findOne({
        _id: req.params.id
      })
        .then(offer => {
          let tag = "";
          if (offer.tag.length > 0) {
            offer.tag.forEach(item => {
              // console.log(item.text);
              tag = tag + item.text.toLowerCase() + ',';
            })
            tag = tag.slice(0, -1);
          }
          if (offer.user != req.user.id) {
            res.redirect('/offers/my')
          } else {
            res.render('offers/edit', {
              offer: offer,
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
  Offer.findOne({
    _id: req.params.id
  })
    .then(offer => {
      console.log('/createSubmission route we made it !')
      // if (offer.user != req.user.id) {
      //   res.redirect('/offers/my')
      // } else {
      Offer.findOne({
        _id: req.params.id
      })
        .then(offer => {
          let tag = "";
          if (offer.tag.length > 0) {
            offer.tag.forEach(item => {
              // console.log(item.text);
              tag = tag + item.text.toLowerCase() + ',';
            })
            tag = tag.slice(0, -1);
          }

        });
        res.render('offers/createSubmission', {
          offer: offer,
          tag: tag
        });
      // }
    });

});

//process add offer submit
router.post('/addOffer/new', ensureAuthenticated, (req, res) => {
  (async () => {
    console.log('addOffer/new started')
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
  console.log('addOffer 2')
  let newOffer = {
    user: req.user.id,
    ogOwner: req.user.id,
    offerLink: offerLink,
    compensation: req.body.compensation,
    usage: req.body.usage,
    credit: credit,
    approvalNeeded: approvalNeeded,
    welcomeMessage: req.body.welcomeMessage,
    redemptionInstructions: req.body.redemptionInstructions,
    offerType: "Offer"
    //approvalNeeded: approvalNeeded
    //status: req.body.status,
    //allowComments: allowComments,

    //igUsername: igUsername
  }
  console.log('addOffer3')
  // let tagIDs = [];
  // if (req.body.tags.length > 0) {
  //   let tagsArr = req.body.tags.split(',');
  //   tagsArr.forEach(item => {
  //     tagIDs.push({ text: item.toLowerCase() });
  //   });

  //   newOffer.tag = tagIDs;
  // }

  // console.log(newOffer;
  // return;
  console.log('addOffer3.5')
  console.log('this is the newOffer' + JSON.stringify(newOffer))
  //create offer
  new Offer(newOffer)
    .save()
    .then(offer => {
      console.log('addOffer4')
      //res.redirect(`/offers/show/${offer.id}`);
      res.redirect(`/offers/createSubmission/${offer.id}`);
      //res.render('you did it you submitted an Offer to be created')
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

  //create offer
  new Offer(newProposal)
    .save()
    .then(offer => {
      res.redirect(`/offers/show/${offer.id}`);
    })

  })()
})

// //process add exchange attempt2 offer customer
// router.post('/createSubmission/new', ensureAuthenticated, (req, res) => {
//   //console.log('exchange1')
//   (async ()=> {
//     let credit;
//     if (req.body.credit) {
//       credit = true;
//     } else {
//       credit = false;
//     }
//     console.log('exchange2')

//     let url = req.body.url;
//     let n = url.indexOf('?');
//     url = url.substring(0, n != -1 ? n : url.length);
  
//     // / Create the base function to be ran /
//     let igUsername;  
//     console.log('exchange3')

//     try {
//         let html = await request(url);
//         const doc = domino.createWindow(html).document;
//         const metadata = getMetadata(doc, url);
//         if (metadata != null && metadata.description != null) {
//           igUsername=metadata.description.match(/\(([^)]+)\)/)[1];
//           console.log('metadata is', metadata.description.match(/\(([^)]+)\)/)[1]);
//           console.log(igUsername);
//         } else {
//           console.log('either metadata is undefined or it does not contains the description name')
//         }
//         debugger;
//     } catch {
//          console.log('something went wrong with the scraper probably that multiphoto for private user scenario')
//     }
//     console.log('exchange4')

//     let newProposal = {
//       url: url,
//       compensation: req.body.compensation,
//       usage: req.body.usage,
//       credit: credit,
//       user: req.user.id,
//       igUsername: igUsername,
//       ogOwner: req.body.ogOwner,
//       proposalType: "Offer"
//     }
//     console.log('exchange5')

//     new Offer(newProposal)
//       .save()
//       .then(offer => {
//         console.log('exchange6')

//         res.redirect(`/offers/showSubmission/${offer.id}`);
//       })
  

//   })()
// })
// //edit exchange form customer
// router.get('/createSubmission/:id', ensureAuthenticated, (req, res) => {

//   let tag
//   Proposal.findOne({
//     _id: req.params.id
//   })
//     .then(proposal => {
//       console.log('/createSubmission route we made it !')
//       // if (proposal.user != req.user.id) {
//       //   res.redirect('/proposals/my')
//       // } else {
//       Proposal.findOne({
//         _id: req.params.id
//       })
//         .then(proposal => {
//           let tag = "";
//           if (proposal.tag.length > 0) {
//             proposal.tag.forEach(item => {
//               // console.log(item.text);
//               tag = tag + item.text.toLowerCase() + ',';
//             })
//             tag = tag.slice(0, -1);
//           }

//         });
//         res.render('proposals/createSubmission', {
//           proposal: proposal,
//           tag: tag
//         });
//       // }
//     });

// });


// router.post('/tags', ensureAuthenticated, (req, res) => {
//   Offer.find({ user: req.user.id }, { tag: true })
//     .then(p => {
//       let tags = [];
//       if (p.length > 0) {
//         p.forEach(offer => {
//           if (offer.tag.length > 0) {
//             offer.tag.forEach(item => {
//               tags.push(item.text.toLowerCase());
//             })
//           }
//         })
//       }
//       let result = [];
//       let map = new Map();
//       for (let item of tags) {
//         if (!map.has(item)) {
//           map.set(item, true);    // set any value to Map
//           result.push(item.toLowerCase());
//         }
//       }
//       var PATTERN = new RegExp(req.body.keyword, 'i');
//       console.log(PATTERN);
//       var filtered = result.filter(function (str) { return PATTERN.test(str); });
//       res.json((req.body.keyword == "" || req.body.keyword == null) ? [] : filtered);
//     })
// });

module.exports = router;