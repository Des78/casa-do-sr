const InnerThingSeparator = "-_-";


exports.changeStateRequest = (req, res) => {
    const util = require('../services/utilities');   
    const thingName = util.getParam(req, "thing");
    const newState = util.getParam(req, "state");
    const userKey = util.getParam(req, "key");
    const stateSource = util.getParam(req, "source");

    let resultObj = changeState(thingName, newState, userKey, stateSource);

    if (process.env.FWD_URL) {
        // forward request to secondary server
        const requester = require('request');
        requester(process.env.FWD_URL + "/ping", function (error, response, body) {
          if (response && response.statusCode === 200) 
          {
            console.log("Forwarding to " + process.env.FWD_URL);
            let postData = {
                thing: thingName,
                state: newState,
                key: userKey,
                source: stateSource
            };

            let reqOptions = {
              method: 'post',
              body: postData,
              json: true,
              url: process.env.FWD_URL + "/ChangeState"
            };

            requester(reqOptions);
            //requester(process.env.FWD_URL + "/ChangeState/"+thingName+"/"+newState+"/"+userKey);
          }
          else 
          {
            console.log("Secondary host " + process.env.FWD_URL + " ping service failed: \n" + (response? response.statusCode: error));
          }
        });
  
    }


    //res.sendStatus(resultObj.errorCode);
    res.status(resultObj.errorCode).send(resultObj.resultSummary);
  };


exports.changeState = changeState;
function changeState(thingName, newState, userKey, stateSource) {

    var resultObj = {
        resultSummary :"OK",
        resultMessages : [],
        isError: false,
        errorCode : 200,
        errorDetails : null,
        returnMessage : "Back",
        returnLink : "/",
        isAsync: false
      };

    console.log("ChangeState: " + thingName + " " + newState + "(" + stateSource + ") " + userKey);
      
    if (userKey) {
        const persistMgr = require('../services/persistenceManager');

        let childThingName = "";
        let childNewState = "";
        let thing = persistMgr.getThing(thingName, userKey);
        if (!thing && thingName.includes(InnerThingSeparator)) {
          // composed thing
          childThingName = thingName;
          childNewState = newState;
          thingName = childThingName.substring(0, childThingName.indexOf(InnerThingSeparator));
          thing = persistMgr.getThing(thingName, userKey);
        }

        if (thing) {
            if (childThingName) {
              newState = thing.getParentStateForInnerStateChange(childThingName, newState);
              console.log("  ChangeParentState: " + thingName + " " + newState);
            }

            thing.state = newState;
            thing.stateSource = stateSource? stateSource: "unknown";

            persistMgr.saveThing(thing, userKey);
            resultObj.resultSummary = thingName + " state changed to " + newState;

            // publish state changed
            const socketMgr = require('../services/socketManager');
            socketMgr.publish(userKey, "StateChanged", { thing: thingName, newState: newState, source: stateSource } );
            const eventMgr = require('../services/eventManager');
            eventMgr.emit("state:"+thingName, thing);
            eventMgr.emit("state:"+thingName+"_"+newState, thing);
            if (childThingName) {
              eventMgr.emit("state:"+childThingName, thing);
              eventMgr.emit("state:"+childThingName+"_"+childNewState, thing);  
            }
          }
        else {
            resultObj.errorCode = 400;
            resultObj.resultSummary = "could not find " + thingName + " for user key";
            resultObj.isError = true;
        }
    }
    else {
        resultObj.errorCode = 401;
        resultObj.resultSummary = "user key not provided";
        resultObj.isError = true;
    }

    if (resultObj.isError)
      console.warn(resultObj.resultSummary);

    return resultObj;
}

