
exports.runWfRequest = (req, res) => {
    const util = require('../services/utilities');   
    const wfName = util.getParam(req, "workflow");
    const userKey = util.getParam(req, "key");

    runWf(wfName, userKey).then(resultObj => {
      res.status(resultObj.errorCode).send(resultObj.resultSummary);
    }).catch(error => {
      console.error(error);
      res.status(500).send(error.message? error.message: error);
    });

  };


exports.runWf = runWf;
async function runWf(wfName, userKey) {

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

    console.log("Run WF: " + wfName + " / " + userKey);
      
    if (userKey) {
        const persistMgr = require('../services/persistenceManager');

        let wfs = persistMgr._getWorkflows();

        let wf = wfs.find(w => {return w.name === wfName});

        if (wf && wf.evaluate("run", null)) {
          try {
            await wf.run("run", null);
            resultObj.resultSummary = "Ran WF " + wf.name;           
          } catch (error) {
            resultObj.errorCode = 500;
            resultObj.resultSummary = "error running workflow " + wfName;
            resultObj.errorDetails = error;
            if (error && error.message)
              resultObj.resultMessages.push(error.message);
            resultObj.isError = true;          
          }          
        }
        else {
            resultObj.errorCode = 400;
            resultObj.resultSummary = "could not run workflow " + wfName + " for user key";
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
    else
      console.log(resultObj.resultSummary);

    return resultObj;
}

