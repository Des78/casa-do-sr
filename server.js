// server.js
// where your node app starts

// init project
const express = require('express');
const bodyParser = require('body-parser');
const engines  = require('consolidate');
const request = require('request');
const cookieSession = require('cookie-session');
const envConfig = require('dotenv').config();
const app = express();

// set view engine
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.engine('mustache', engines.mustache);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieSession({
  name: 'session',
  secret: 'sr-dropbox-auth-secret',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 1 month
}));
/*
// Redirect to /dropbox/auth if token doesn't exist
app.use((req, res, next) => {
  console.log('request path: ' + req.path);
  
  // Check for token
  if (req.session.token) {
    next();
  } else {
    if (/\/dropbox/i.test(req.path) || req.path.endsWith(".js") || req.path.endsWith(".css")) {
      // Skip /dropbox routes and css, js files
      next();
    }
    else {  
      // redirect to dropbox auth page
      console.log('rederecting to dropbox pre-auth');
      res.redirect('/dropbox/auth');
    }
  }
});
*/
require('./routes')(app);

// initialize DB
require('./services/persistenceManager')


//require('./_tester').createTestData();
//require('./_tester').testObjModel();

// listen for requests :)
   const listener = app.listen(process.env.PORT, function () {
     console.log('Your app is listening on port ' + listener.address().port);
   });




