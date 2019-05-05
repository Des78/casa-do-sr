// services/ifttt.js
'use strict';

const request = require('request-promise-native');


const baseURL = "https://maker.ifttt.com/trigger/";
const withKey = "/with/key/";
 

exports.iftttRequest = (req, response) => {
  try {
    console.log("Handling IFTTT webhook trigger request");

    const util = require('./utilities');   
    const trigger = util.getParam(req, "trigger");
    const userKey = util.getParam(req, "key");
    // optional params
    const thingName = util.getParam(req, "thing");
    const newState = util.getParam(req, "state");
    const resultsFormat = util.getParam(req, "showResults");

    let triggers = [trigger];
    // Call IFTTT
    //var resultObj = 
    launchTriggerEvents(triggers, userKey).then(resultObj => {

      // Change thing state if passed as parameter, instead of waiting for state to be propagated from IFTTT (doesn't work most times when the state change is triggered from ifttt)
      if (thingName && newState && (resultObj.errorCode === 0 || resultObj.errorCode === 200)) {
        const stateMgr = require('./stateManager');
        stateMgr.changeState(thingName, newState, userKey, false);
      }

      if (resultsFormat === "html")
        // Manual mode - redirect to success/error page
        response.render("result.html", resultObj);
      else if (resultsFormat === "json")
        // Caller controlled display - return result json object
        response.status(resultObj.errorCode).send(resultObj);
      else
        // Automatic trigger - no need to return anything
        //response.end();  
        //res.sendStatus(statusCode);
        response.status(resultObj.errorCode).send(resultObj.resultSummary);
    }).catch(error => {
      console.error(error);
      response.status(500).send(error.message? error.message: error);
    });

  } catch (error) {
    console.error(error);
    response.status(500).send(error.message? error.message: error);
  }
 }



 

  // Loops through each event and where it finds a value for it in .env it will make a request to IFTTT using it
  exports.launchTriggerEvents = launchTriggerEvents;
  
  async function launchTriggerEvents(triggers, userKey) {  
    var resultObj = {
      resultSummary :"Fired IFTTT " + triggers + " triggers.",
      resultMessages : [],
      isError: false,
      errorCode : 200,
      errorDetails : null,
      returnMessage : "Back",
      returnLink : "/"
    };

    if (userKey) {
      const persistMgr = require('./persistenceManager');
  
      let iftttMakerUrl = persistMgr.getUserConfigEntry(userKey, "iftttMakerUrl");
      if (iftttMakerUrl) { 
        let urlTokens = iftttMakerUrl.split('/');
        let iftttId = urlTokens[urlTokens.length-1];
  
        for (var i = 0; i < triggers.length; i++)
        {
          if(triggers[i]){
            let trigger = triggers[i];
            // Make a request to baseURL + triggerEvent + withKey + iftttId, which is the complete IFTTT Maker Request URL
            var iftttUrl = baseURL + trigger + withKey + iftttId;
            console.log(iftttUrl);

            try {
              var response = await request({uri: iftttUrl, resolveWithFullResponse: true});
              if (response.statusCode == 200) {
                resultObj.resultMessages.push(" " + response.body); // Show the response from IFTTT
              }
              else {
                var errorMsg = (response.body? response.body: "unknown error?");
                resultObj.errorCode = response.statusCode;
              }
            }
            catch(error)
            {
              var errorObj = error;
              var errorMsg = error.message? error.message: error;
              resultObj.errorCode = 500;
            }

            if (errorMsg) {
              resultObj.resultSummary = "There were errors triggereing IFTTT events for '" + trigger +"'";
              resultObj.resultMessages.push("ERROR firing "+trigger+" - " + resultObj.errorCode + ": " + errorMsg);
              resultObj.errorDetails = {};
              resultObj.errorDetails.error = errorObj? errorObj: errorMsg;
              resultObj.isError = true;
            }
            console.log(resultObj.resultMessages[resultObj.resultMessages.length-1]);
          }
        }  
      }
      else {
        resultObj.errorCode = 400;
        resultObj.resultSummary = "could not find iftttMakerUrl setting for user key"
        resultObj.isError = true;
      }
    }
    else {
      resultObj.errorCode = 401;
      resultObj.resultSummary = "user key not provided";
      resultObj.isError = true;
    }
  
    console.log(resultObj.resultSummary);

    return resultObj;
  }
  
