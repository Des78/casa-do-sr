// controllers/dropbox.js
'use strict';

const request = require('request');

  function getToken(code, callback) {
    request.post({
      url: 'https://api.dropboxapi.com/oauth2/token',
      qs: {
        code: code,
        grant_type: 'authorization_code',
        client_id: process.env.DROPBOX_APP_KEY,
        client_secret: process.env.DROPBOX_APP_SECRET
      }
    }, callback);
  }


  exports.index = (req, res) => {
    // check for dropbox authorization cookie
    let token = req.session.token;
    if (!token) {
      // show page for dropbox authorization 
      res.render('dropboxauth.html');
    }
    else {
    // show main page
      res.redirect('/');
    }

    /*
    var dbx = new Dropbox({ accessToken: token });
    dbx.filesListFolder({ path: '' })
      .then((response) => {
        res.render('index', { entries: response.entries });
      })
      .catch(function(error) {
        res.render('index', { error: error });
      });
      */
  };

  exports.getAuth = (req, res) => {
    let authorizeUrl = `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=${process.env.DROPBOX_APP_KEY}`;
    res.redirect(authorizeUrl);
  }


  exports.create = (req, res) => {
    let code = req.body.code;
    var resultObj = {
      resultSummary : "Dropbox authorization code associated",
      resultMessages : [],
      isError: false,
      errorCode : undefined,
      errorDetails : null,
      returnMessage : "Back",
      returnLink : "/"
    };
    
    if (!code) {
      resultObj.resultSummary = "Missing Dropbox authorization Code parameter";
      resultObj.returnLink = "/dropbox/auth";
      resultObj.isError = true;
      res.status(400).render("result.html", resultObj);
      return;
    }
    
    getToken(code, (error, request, body) => {
      let data = JSON.parse(body);
      
      if (request.statusCode != 200) {
          resultObj.resultSummary = "Error validating Dropbox authorization code";
          resultObj.returnLink = "/dropbox/auth";
          resultObj.isError = true;
          resultObj.errorCode = request.statusCode;
          resultObj.errorDetails = data;
          res.status(request.statusCode).render("result.html", resultObj);
        return;
      }
  
      req.session.token = data.access_token;
      res.render("result.html", resultObj);
    });
  }
  
  exports.logout = (req, res) => {
    req.session = null;
    res.redirect('/');
  };