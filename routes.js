'use strict';

module.exports = (app) => {
  var main = require('./controllers/main');
  app.get('/', main.index);

  var util = require('./services/utilities');
  app.all('/ping', util.ping);

  var things = require('./controllers/things');
  app.get('/thingsList', things.list);

  
  // handle state change requests
  var stateMgr = require('./services/stateManager');
  app.all('/ChangeState/:thing?/:state?/:key?', stateMgr.changeStateRequest);

  // Handle requests for IFTTT
  var ifttt = require('./services/ifttt');
  app.post('/ifttt/:trigger?/:key?', ifttt.iftttRequest);


  


  // OLD - dropbox authentication...
  var dropbox = require('./controllers/dropbox');
  app.get('/dropbox/auth', dropbox.index);
  app.get('/dropbox/getAuth', dropbox.getAuth);
  app.post('/dropbox/createLink', dropbox.create);
  app.get('/dropbox/unlink', dropbox.logout);

};