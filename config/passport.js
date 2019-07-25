const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');

//load user model
const User = mongoose.model('users');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy ({
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      //this is the callback that you registered with google when you registered your app and received id and secret
      callbackURL: '/auth/google/callback',
      proxy: true
    }, (accessToken, refreshToken, profile, cb) => {
      console.log(accessToken);
      // console.log(profile);
      //api changed since vid was made and we no longer need to remove ?sz=50
      const image = profile.photos[0].value;

      const newUser = {
        googleID: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        image: image
      }

      //check for existing user
      User.findOne({
        googleID: profile.id
      }).then(user => {
        if(user) {
          //return user
          return cb(null, user);
        } else {
          //create user
          new User(newUser)
            .save()
            .then(user => { return cb(null, user)});
        }
      })
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
    .then(user => done(null, user));
  });
}
