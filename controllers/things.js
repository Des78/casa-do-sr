// controllers/things.js
'use strict';

exports.list = (req, res) => {

  var tplData = {};

  const util = require('../services/utilities');
  const userKey = util.getParam(req, "user")

  const persistMgr = require('../services/persistenceManager')

  tplData.things = persistMgr.getUserThings(userKey);


  // show things list
  res.render('things.mustache', tplData);

};

