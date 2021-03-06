var slug = require('slug');
slug.defaults.modes['rfc3986'] = {
    replacement: '-',      // replace spaces with replacement
    symbols: true,         // replace unicode symbols or not
    remove: null,          // (optional) regex to remove characters
    charmap: slug.charmap, // replace special characters
    multicharmap: slug.multicharmap // replace multi-characters
};
slug.charmap['@'] = "-";
slug.charmap['.'] = "-";

// TODO: this should be part of mschema. see: https://github.com/mschema/mschema/issues/10
var address = {
  "type": "string",
  "regex": /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
};

module['exports'] = function view (opts, callback) {

  var userResource = require('../lib/resources/user');

  var $ = this.$,
      req = opts.request,
      res = opts.response,
      params = req.resource.params,
      user = opts.request.user;

  // enables curl signups
  // curl http://hook.io?signup=youremail@marak.com
  if (typeof params.signup !== "undefined" && params.signup.length > 0) { // TODO: email validation
    // TODO: this should be part of mschema. see: https://github.com/mschema/mschema/issues/10
    if(!address.regex.test(params.signup)) { // test email regex
      return res.end(params.signup + ' is an invalid email address...');
    }
    var query = { email: params.signup };
    return userResource.find(query, function(err, results){
      if (err) {
        return res.end(err.stack);
      }
      if (results.length > 0) {
        return res.end(params.signup + ' is already signed up!');
      }
      return userResource.create({ email: params.signup, name: slug(params.signup) }, function(err, result){
        if (err) {
          return res.end(err.stack);
        }
        return res.send(params.signup + ' is now signed up!');
      });
    });
  }

  if (typeof user === "undefined") {
    $('.userBar').remove();
  } else {
    $('.userBar .welcome').html('Welcome <strong>' + user.username + "</strong>!")
    $('.loginBar').remove();
    $('.tagline').remove();
    $('.yourHooks').attr("href", "/" + user.username);
    $('.splash').remove();
  }

  callback(null, this.$.html());
};