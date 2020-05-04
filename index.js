const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
require('./models/User');
require('./models/Survey')
require('./services/passport');

mongoose.connect(keys.mongoURI,  { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.json());
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);
app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);
require('./routes/billingRoutes')(app);
require('./routes/surveyRoutes')(app)

if(process.env.NODE_ENV === 'production') {    //FOLLOWING CODE EXECUTES IN ORDER IF ROUTE DOESNT FIND FILE IN 1ST ROUTE THEN IT GOES TO 2ND IE. app.get('*')
  //Express will serve up production assets like main.js or main.css for any route like *ANY* other than billing and auth route
  app.use(express.static('client/build'))           //*OR* then it goes to app.get('*') if it doesnt find any route in client build 
                                                    
  //Express will serve up index.html if it doesn't recognise route  like any route *app.get('*')* 
  const path = require('path')
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
