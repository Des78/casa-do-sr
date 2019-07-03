// controllers/main.js
'use strict';

 exports.index = (req, res) => {

    // check for dropbox authorization cookie
    //let token = req.session.token;
    //if (token) {
      // prepare data for main page
      var tplData = {};

      const persistMgr = require('../services/persistenceManager')
      tplData.usersData = persistMgr._getUsersData().slice();
      //add blank user
      //tplData.usersData.unshift({});

      tplData.wfs = persistMgr._getWorkflows().slice();
      //add blank wf
      tplData.wfs.unshift({});


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