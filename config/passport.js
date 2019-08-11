const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const InstagramStrategy = require('passport-instagram').Strategy;
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
      console.log(profile);
      //api changed since vid was made and we no longer need to remove ?sz=50
      const image = profile.photos[0].value;

      let newUser = {
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

  // passport.use(new InstagramStrategy({
  //   clientID: keys.instagramClientID,
  //   clientSecret: keys.instagramClientSecret,
  //   callbackURL: '/auth/instagram/callback'
  //   // proxy: true
  // }, function(accessToken, refreshToken, profile, done) {
  //     console.log(accessToken);
  //     console.log(profile);
  //   //User.findOrCreate({ instagramId: profile.id }, function (err, user) {
  //     //return done(null, profile);
  //   //});
  //     let newUser = {
  //     instgramDisplayName: profile.displayName,
  //     email: profile.email,
  //     image: profile._json.data.profile_picture
  //     //user.bio = profile._json.data.bio;
  //     //user.media = `https://api.instagram.com/v1/users/${profile.id}/media/recent/?access_token=${accessToken}&count=8`
  //     }

  //     //check for existing user
  //     User.findOne({
  //       instagramID: profile.id
  //     }).then(user => {
  //       if(user) {
  //         //return user
  //         done(null, user);
  //       } else {
  //         //create user
  //         new User(newUser)
  //           .save()
  //           .then(user => done(null, user));
  //       }
  //     })
  // }
  // ));

  // passport.use(new InstagramStrategy({
  //   clientID: keys.instagramClientID,
  //   clientSecret: keys.instagramClientSecret,
  //   callbackURL: '/auth/instagram/callback',
  // },
  // function(accessToken, refreshToken, profile, done) {
  //   // asynchronous verification, for effect...
  //   process.nextTick(function () {
  //     console.log(accessToken);
  //     // To keep the example simple, the user's Instagram profile is returned to
  //     // represent the logged-in user.  In a typical application, you would want
  //     // to associate the Instagram account with a user record in your database,
  //     // and return that user instead.
  //     return done(null, profile);
  //   });
  // }
  // ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
    .then(user => done(null, user));
  });
}


//https://stackoverflow.com/questions/57278266/failed-to-retrieve-accesstoken-from-instagram-with-passportjs