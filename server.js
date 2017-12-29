// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var iftttId;
var baseURL = "https://maker.ifttt.com/trigger/";
var withKey = "/with/key/";

// Get the Id from IFTTT Maker URL
if(!process.env.IFTTT_MAKER_URL)
  console.log("You need to set your IFTTT Maker URL - copy the URL from https://ifttt.com/services/maker/settings into the .env file against 'IFTTT_MAKER_URL'");
else
  iftttId = process.env.IFTTT_MAKER_URL.split('https://maker.ifttt.com/use/')[1];

// Show the homepage
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('views'));

app.use(bodyParser.json());

// Handle requests from IFTTT
app.post("/ifttt", function (request, response) {
  console.log("Request received from IFTTT");
  console.log(request.body);
  
  launchTriggerEvents(request.body.Trigger); 
  
  response.end();  
});


// Test requests
app.post("/test", function (request, response) {
  launchTriggerEvents("TestTrigger");
});

app.post("/LightsOn", function (request, response) {
  launchTriggerEvents("LightsOn");
});

app.post("/LightsOut", function (request, response) {
  launchTriggerEvents("LightsOut");
});


app.get('/hallo', function(req, res){
  //console.log(req);
  res.send('hello world');
});


// initialize config
var triggerEventMap = {};
initEventMap();


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});



// Loops through each event and where it finds a value for it in .env it will make a request to IFTTT using it
function launchTriggerEvents(trigger){  
  
  // configure IFTTT body to pass a trigger parameter
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
          // Make a request to baseURL + triggerEvent + withKey + iftttId, which is the complete IFTTT Maker Request URL
          request(baseURL + events[i] + withKey + iftttId, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log("  " + body); // Show the response from IFTTT
            }
            else
              console.log(response.statusCode + " : " + error);
          });
        }
      }
      setTimeout(function(){ console.log("Done triggering."); },1000);
    }
    else
      console.log("No Events setup for Trigger " + trigger);  
  }
  else
    console.log("No Trigger parameter in IFTTT request body");

  
}




function initEventMap(){
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

