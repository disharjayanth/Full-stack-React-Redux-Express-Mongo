const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');                   

passport.serializeUser((user, done) => {    //Used to send user.id to cookie session where it's encrypted
  done(null, user.id);                      //with keys, then cookie is made to store in user's browser
});                                         //for maxAge duration. user.id is sent to cookieSession for encryp 

passport.deserializeUser((id, done) => {    //Cookie Session seperates encrypted data from keys and *user.id*
  User.findById(id).then(user => {          //(id we want) and sent to .deserialize function. Here find it in
    done(null, user);                       //database and send it to route as middleware(passport does it for us)
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {                
      const existingUser = await User.findOne({ googleId: profile.id }); 

      if (existingUser) {                                            //If user exists send that user data to
        return done(null, existingUser);                             //.serialize function with *done()*
      }                                                              // no error 1st arg null

      const user = await new User({ googleId: profile.id }).save(); //If user doesnt exist, create new one
      done(null, user);                                             // and save and call done
    }
  )
);