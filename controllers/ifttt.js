// controllers/ifttt.js
'use strict';

const request = require('request');


const baseURL = "https://maker.ifttt.com/trigger/";
const withKey = "/with/key/";
 

exports.iftttRequest = (req, response) => {
  console.log("Handling IFTTT webhook trigger request");

  const util = require('../services/utilities');   
  const trigger = util.getParam(req, "trigger");
  const userKey = util.getParam(req, "key");
  // optional params
  const thingName = util.getParam(req, "thing");
  const newState = util.getParam(req, "state");
  const showResultsPage = util.getParam(req, "showResults");

  let triggers = [trigger];
  var resultObj = launchTriggerEvents(triggers, userKey);
  
  
  // TODO: Change thing state if passed as parameter? instead of state to be propagated from IFTTT (doesn't work most times when the state change is triggered from ifttt)


  if (showResultsPage)
    // Manual mode - redirect to success/error page
    setTimeout(function(resultObj){ response.render("result.html", resultObj) }, resultObj.isAsync? 3000: 0, resultObj);
  else
    // Automatic trigger - no need to return anything
    //response.end();  
    //res.sendStatus(statusCode);
    res.status(resultObj.errorCode).send(resultObj.resultSummary);
 }



 

  // Loops through each event and where it finds a value for it in .env it will make a request to IFTTT using it
  exports.launchTriggerEvents = launchTriggerEvents;
  
  function launchTriggerEvents(triggers, userKey) {  

    var resultObj = {
      resultSummary :"Fired IFTTT " + triggers + " triggers.",
      resultMessages : [],
      isError: false,
      errorCode : 200,
      errorDetails : null,
      returnMessage : "Back",
      returnLink : "/",
      isAsync: true
    };

    if (userKey) {
      const persistMgr = require('../services/persistenceManager');
  
      let iftttMakerUrl = persistMgr.getUserConfigEntry(userKey, "iftttMakerUrl");
      if (iftttMakerUrl) { 
        let urlTokens = iftttMakerUrl.split('/');
        let iftttId = urlTokens[urlTokens.length-1];
  
        for (var i = 0; i < triggers.length; i++)
        {
          if(triggers[i]){
            setTimeout(function(trigger, resultObj) {
              // Make a request to baseURL + triggerEvent + withKey + iftttId, which is the complete IFTTT Maker Request URL
              var iftttUrl = baseURL + trigger + withKey + iftttId;
              console.log(iftttUrl);
              request(iftttUrl, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  resultObj.resultMessages.push(" " + body); // Show the response from IFTTT
                }
                else {
                  var errorMsg = (error? error: (body? body: ""));
                  resultObj.resultSummary = "There were errors triggereing IFTTT events for '" + trigger +"'";
                  resultObj.resultMessages.push("ERROR firing "+trigger+" - " + response.statusCode + ": " + errorMsg);
                  resultObj.errorCode = response.statusCode;
                  resultObj.errorDetails = {};
                  resultObj.errorDetails.error = errorMsg;
                  resultObj.isError = true;
                }
                console.log(resultObj.resultMessages[resultObj.resultMessages.length-1]);
              });
            }, 200, triggers[i], resultObj);
          }
        }  

        setTimeout(function(){ console.log("Done triggering."); }, 1000 + 200*i);
      }
      else {
        resultObj.errorCode = 400;
        resultObj.resultSummary = "could not find iftttMakerUrl setting for user key"
        resultObj.isError = true;
        resultObj.isAsync = false;
      }
    }
    else {
      resultObj.errorCode = 401;
      resultObj.resultSummary = "user key not provided";
      resultObj.isError = true;
      resultObj.isAsync = false;
    }
  
    console.log(resultObj.resultSummary);

    return resultObj;
  }
  
