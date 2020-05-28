const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');                   

passport.serializeUser((user, done) => {    //Used to send user.id to cookie session where it's encrypted
  done(null, user.id);                      //with keys, then cookie is made to store in user's browser
}); //for outgoing                          //for maxAge duration. user.id is sent to cookieSession for encryp 
//serialise is only used once in logging In phase where user data sent from GoogleStartergy in callback, user.id is removed then its encypted by secret key for maxTime (in app.use(cookieSession) and in app.use(passport)) then set in cookies in client

//in subsequent incoming request here token from cookie is removed from client request , id is seperated from secret key and we get the id here for user data and this user data is embeded as req.user by (passport) in routes
passport.deserializeUser((id, done) => {    //Cookie Session seperates encrypted data from keys and *user.id*
  User.findById(id).then(user => {          //(id we want) and sent to .deserialize function. Here find it in
    done(null, user);                       //database and send it to route as middleware(passport does it for us)
  });//for incoming                         //receives id from browser client then in this deserialize function ID
});                                         //is used to find user data and that data is put in req.user by passport middleware and sent to app routes  
                                            //where we can access user data in req.user Ex in app.get('/api/current_user) to get current user data for checking whether the user is logged in or not . If user is logged in then send user data to fetchUser action creator
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true                           //This option is used for Heroku proxy
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