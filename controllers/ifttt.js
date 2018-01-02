// controllers/ifttt.js
'use strict';

const request = require('request');

var iftttId;
var baseURL = "https://maker.ifttt.com/trigger/";
var withKey = "/with/key/";
var triggerEventMap = {};


initIftttConfig();


  exports.handleIftttEvent = (request, response) => {
    console.log("Request received from IFTTT");
    console.log(request.body);
    
    var resultObj = launchTriggerEvents(request.body.trigger); 
    
    if (request.body.showResults)
      // Manual mode - redirect to success/error page
      setTimeout(function(resultObj){ response.render("result.html", resultObj) }, resultObj.isAsync? 3000: 0, resultObj);
    else
      // Automatic trigger from IFTTT - no need to return anything
      response.end();  
  }


  exports.getIftttConfig = () => {
    if (triggerEventMap.length > 0)
      initIftttConfig();

    return triggerEventMap;  
  }


  // Loops through each event and where it finds a value for it in .env it will make a request to IFTTT using it
  exports.launchTriggerEvents = launchTriggerEvents;
  
  function launchTriggerEvents(trigger) {  

    var resultObj = {
      resultSummary :"Fired IFTTT events for '" + trigger +"' trigger",
      resultMessages : [],
      isError: false,
      errorCode : undefined,
      errorDetails : null,
      returnMessage : "Back",
      returnLink : "/",
      isAsync: true
    };

    // IFTTT webhook body needs to be configured to pass a trigger parameter
    // e.g. {"Trigger": "Sunset"}
    if (trigger)
    {
      if (triggerEventMap[trigger])
      {
        var events = triggerEventMap[trigger];
        console.log("Triggering events [" + events + "] for " + trigger);
  
        for (var i = 0; i < events.length; i++)
        {
          if(events[i]){
            setTimeout(function(event, resultObj) {
              // Make a request to baseURL + triggerEvent + withKey + iftttId, which is the complete IFTTT Maker Request URL
              var iftttUrl = baseURL + event + withKey + iftttId;
              console.log(iftttUrl);
              request(iftttUrl, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  resultObj.resultMessages.push(" " + body); // Show the response from IFTTT
                }
                else {
                  var errorMsg = (error? error: (body? body: ""));
                  resultObj.resultSummary = "There were errors triggereing IFTTT events for '" + trigger +"'";
                  resultObj.resultMessages.push("ERROR firing "+event+" - " + response.statusCode + ": " + errorMsg);
                  resultObj.errorCode = response.statusCode;
                  resultObj.errorDetails = {};
                  resultObj.errorDetails.error = errorMsg;
                  resultObj.isError = true;
                }
                console.log(resultObj.resultMessages[resultObj.resultMessages.length-1]);
              });
            }, 200, events[i], resultObj);
          }
        }
        setTimeout(function(){ console.log("Done triggering."); }, 1000 + 200*i);
      }
      else {
        resultObj.resultSummary = "No Events configured for Trigger " + trigger;
        resultObj.isAsync = false;
      }
    }
    else {
      resultObj.resultSummary = "No 'trigger' parameter in IFTTT request body";
      resultObj.isError = true;
      resultObj.isAsync = false;
    }
    console.log(resultObj.resultSummary);
    
    return resultObj;
  }
  

function initIftttConfig(){

  // Get the Id from IFTTT Maker URL
  require('dotenv').config();
  console.log(process.env.IFTTT_MAKER_URL);
  if(!process.env.IFTTT_MAKER_URL)
    console.log("You need to set your IFTTT Maker URL - copy the URL from https://ifttt.com/services/maker/settings into the .env file against 'IFTTT_MAKER_URL'");
  else
    iftttId = process.env.IFTTT_MAKER_URL.split('https://maker.ifttt.com/use/')[1];


  // create a dictionary to map IFTTT webhooks requests (triggers) to webhook request events
  if (process.env.IFTTT_TRIGGER_1)
  {
    var eventList = [];
    if (process.env.IFTTT_TRIGGER_1_EVENT_1) eventList[0] = process.env.IFTTT_TRIGGER_1_EVENT_1;
    if (process.env.IFTTT_TRIGGER_1_EVENT_2) eventList[1] = process.env.IFTTT_TRIGGER_1_EVENT_2;
    if (process.env.IFTTT_TRIGGER_1_EVENT_3) eventList[2] = process.env.IFTTT_TRIGGER_1_EVENT_3;
    if (process.env.IFTTT_TRIGGER_1_EVENT_4) eventList[3] = process.env.IFTTT_TRIGGER_1_EVENT_4;
    if (process.env.IFTTT_TRIGGER_1_EVENT_5) eventList[4] = process.env.IFTTT_TRIGGER_1_EVENT_5;
    triggerEventMap[process.env.IFTTT_TRIGGER_1] = eventList;
  }
  if (process.env.IFTTT_TRIGGER_2)
  {
    var eventList = [];
    if (process.env.IFTTT_TRIGGER_2_EVENT_1) eventList[0] = process.env.IFTTT_TRIGGER_2_EVENT_1;
    if (process.env.IFTTT_TRIGGER_2_EVENT_2) eventList[1] = process.env.IFTTT_TRIGGER_2_EVENT_2;
    if (process.env.IFTTT_TRIGGER_2_EVENT_3) eventList[2] = process.env.IFTTT_TRIGGER_2_EVENT_3;
    if (process.env.IFTTT_TRIGGER_2_EVENT_4) eventList[3] = process.env.IFTTT_TRIGGER_2_EVENT_4;
    if (process.env.IFTTT_TRIGGER_2_EVENT_5) eventList[4] = process.env.IFTTT_TRIGGER_2_EVENT_5;
    triggerEventMap[process.env.IFTTT_TRIGGER_2] = eventList;
  }
  if (process.env.IFTTT_TRIGGER_3)
  {
    var eventList = [];
    if (process.env.IFTTT_TRIGGER_3_EVENT_1) eventList[0] = process.env.IFTTT_TRIGGER_3_EVENT_1;
    if (process.env.IFTTT_TRIGGER_3_EVENT_2) eventList[1] = process.env.IFTTT_TRIGGER_3_EVENT_2;
    if (process.env.IFTTT_TRIGGER_3_EVENT_3) eventList[2] = process.env.IFTTT_TRIGGER_3_EVENT_3;
    if (process.env.IFTTT_TRIGGER_3_EVENT_4) eventList[3] = process.env.IFTTT_TRIGGER_3_EVENT_4;
    if (process.env.IFTTT_TRIGGER_3_EVENT_5) eventList[4] = process.env.IFTTT_TRIGGER_3_EVENT_5;
    triggerEventMap[process.env.IFTTT_TRIGGER_3] = eventList;
  }
  if (process.env.IFTTT_TRIGGER_4)
  {
    var eventList = [];
    if (process.env.IFTTT_TRIGGER_4_EVENT_1) eventList[0] = process.env.IFTTT_TRIGGER_4_EVENT_1;
    if (process.env.IFTTT_TRIGGER_4_EVENT_2) eventList[1] = process.env.IFTTT_TRIGGER_4_EVENT_2;
    if (process.env.IFTTT_TRIGGER_4_EVENT_3) eventList[2] = process.env.IFTTT_TRIGGER_4_EVENT_3;
    if (process.env.IFTTT_TRIGGER_4_EVENT_4) eventList[3] = process.env.IFTTT_TRIGGER_4_EVENT_4;
    if (process.env.IFTTT_TRIGGER_4_EVENT_5) eventList[4] = process.env.IFTTT_TRIGGER_4_EVENT_5;
    triggerEventMap[process.env.IFTTT_TRIGGER_4] = eventList;
  }
  if (process.env.IFTTT_TRIGGER_5)
  {
    var eventList = [];
    if (process.env.IFTTT_TRIGGER_5_EVENT_1) eventList[0] = process.env.IFTTT_TRIGGER_5_EVENT_1;
    if (process.env.IFTTT_TRIGGER_5_EVENT_2) eventList[1] = process.env.IFTTT_TRIGGER_5_EVENT_2;
    if (process.env.IFTTT_TRIGGER_5_EVENT_3) eventList[2] = process.env.IFTTT_TRIGGER_5_EVENT_3;
    if (process.env.IFTTT_TRIGGER_5_EVENT_4) eventList[3] = process.env.IFTTT_TRIGGER_5_EVENT_4;
    if (process.env.IFTTT_TRIGGER_5_EVENT_5) eventList[4] = process.env.IFTTT_TRIGGER_5_EVENT_5;
    triggerEventMap[process.env.IFTTT_TRIGGER_5] = eventList;
  } 
}

