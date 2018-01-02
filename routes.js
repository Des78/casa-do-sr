'use strict';

module.exports = (app) => {
  var main = require('./controllers/main');
  app.get('/', main.index);
  
  var dropbox = require('./controllers/dropbox');
  app.get('/dropbox/auth', dropbox.index);
  app.get('/dropbox/getAuth', dropbox.getAuth);
  app.post('/dropbox/createLink', dropbox.create);
  app.get('/dropbox/unlink', dropbox.logout);


  // Handle requests from IFTTT
  var ifttt = require('./controllers/ifttt');
  app.post("/ifttt", ifttt.handleIftttEvent);

};