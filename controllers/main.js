// controllers/main.js
'use strict';

const ifttt = require('./ifttt');

 exports.index = (req, res) => {

    // check for dropbox authorization cookie
    //let token = req.session.token;
    //if (token) {
      // prepare data for main page
      var tplData = {};

      const persistMgr = require('../services/persistenceManager')
      tplData.usersData = persistMgr.getUsersData();
      tplData.usersData.unshift({});


      /* OLD
      tplData.iftttEvents = [];
      let triggerEventMap = ifttt.getIftttConfig();
      Object.keys(triggerEventMap).forEach(function(key) {
        tplData.iftttEvents.push(key);
      });
      // */

      // show main page
      res.render('index.html', tplData);
    //}
    //else {
      // show page for dropbox authorization 
    //  res.redirect('dropbox/auth');
    //}
  };

  exports.logout = (req, res) => {
    req.session = null;
    res.redirect('/');
  };