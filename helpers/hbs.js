const moment = require('moment');

module.exports = {
  truncate: function(str, len) {
    if (str.length > len && str.length > 0) {
      var new_str = str + " ";
      new_str = str.substr(0, len);
      new_str = str.substr(0, new_str.lastIndexOf(" "));
      new_str = (new_str.length > 0) ? new_str : str.substr(0, len);
      return new_str + '...';
    }
    return str;
  },
  //this is a regular expression that will strip any html tags
  stripTags: function(input){
    return input.replace(/<(?:.|\n)*?>/gm, '');
  },
  formatDate: function(date, format) {
    return moment(date).format(format);
  },
  select: function(selected, options) {
    return options.fn(this).replace( new RegExp(' value=\"' + selected + '\"'), '$& selected="selected"').replace( new RegExp('>' + selected + '</option>'), ' selected="selected"$&');
  },
  editIcon: function(proposalUser, loggedUser, proposalId, floating = true){
    if(proposalUser == loggedUser){
      if(floating){
        return `<a href="/proposals/edit/${proposalId}" class="btn-floating halfway-fab red"><i class="fa fa-pencil"></i></a>`;
      } else {
        return `<a class="btn grey waves-effect" href="/proposals/edit/${proposalId}"><i class="fa fa-pencil"></i></a>`;
      }
    } else {
      return '';
    }
  },
  //building an if == helper in handlebars
  ifLoggedUserEqProposalUser: function(proposalUser, loggedUser, opts) {
    if(proposalUser == loggedUser){ // Or === depending on your needs
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
  },
  ifCompensationEqBlank: function(proposalCompensation, opts){
    if(proposalCompensation == "") {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  },
  ifCompanyNameEqBlank: function(userCompanyName, opts){
    if(userCompanyName == "") {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  },
  ifStripeAccountIdEqBlank: function(userStripeAccountId, opts) {
    if(userStripeAccountId == "") {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  },
  ifEquals: function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  },
  // doesn't work how i'd hoped but it would be great if it did
  ifEqualsElse: function(a, b, opts) {
    if(a == b) {
      return opts.fn(this)
    } else {
      return opts.inverse(this)
    }
  },
  ifProposalContractUserTypeEQSeller: function(proposalContractUserType, opts){
    if(proposalContractUserType == "Seller") {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  },
}