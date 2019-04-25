

exports.changeState = (req, res) => {
    let statusCode = 200;
    let statusMsg = "OK";

    const util = require('../services/utilities');   
    const thingName = util.getParam(req, "thing");
    const newState = util.getParam(req, "state");
    const userKey =util. getParam(req, "key");

    console.log("ChangeState params: " + thingName + " " + newState + " " + userKey);
    // console.log("Post: " + req.body);
    // console.log(req.body);
    // console.log("URL: " + req.params);
    // console.log(req.params);
    // console.log("Query: " + req.query);
    // console.log(req.query);

    if (userKey) {
        const persistMgr = require('../services/persistenceManager');
        let thing = persistMgr.getThing(thingName, userKey);
        if (thing) {
            thing.state = newState;
            persistMgr.saveThing(thing, userKey);

            statusMsg = thingName + " state changed to " + newState;
        }
        else {
            statusCode = 400;
            statusMsg = "could not find " + thingName + " for user key"
        }
    }
    else {
        statusCode = 401;
        statusMsg = "user key not provided";
    }

    //res.sendStatus(statusCode);
    res.status(statusCode).send(statusMsg);
  };

