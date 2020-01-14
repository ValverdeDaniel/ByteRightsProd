function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
  }
  
  //process add proposal
  router.post('/', ensureAuthenticated, (req, res) => {
    (async () => {
      try {
  
  
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
        let igUsername;
  
        let url = req.body.url;
        let isValidURL = validURL(url);
        console.log('isvalidurl:', isValidURL);
        let metadata;
        if (isValidURL) {
          //URL BASE CODE
          let n = url.indexOf('?');
          url = url.substring(0, n != -1 ? n : url.length);
          // / Create the base function to be ran /
          //nEED TO add the url validation here, and if it's validated then go ahead
          let html = await request(url);
          const doc = domino.createWindow(html).document;
          metadata = getMetadata(doc, url);
        } else {
          console.log('not a valid url we need to return');
        }
  
        if (metadata != null && metadata.description != null) {
          igUsername = metadata.description.match(/\(([^)]+)\)/)[1];
          console.log('metadata is', metadata.description.match(/\(([^)]+)\)/)[1]);
          console.log(igUsername);
        } else {
          console.log('either metadata is undefined or it does not contains the description name')
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
  
      }
      catch (err) {
        console.log('something went wrong with the scraper probably that multiphoto for private user scenario', err);
        //Maybe we can return an error code (just to help troubleshooting)
      }
  
    })()
  
  })