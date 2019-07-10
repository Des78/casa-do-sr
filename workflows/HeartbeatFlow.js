var Workflow = require('./Workflow');


module.exports = class HeartbeatFlow extends Workflow {

    // events that trigger evaluation and execution of this workflow
  get triggers()  { return ["timeMin:02", "timeMin:10", "timeMin:18", "timeMin:26", "timeMin:34", "timeMin:42", "timeMin:50", "timeMin:58"]; }
  

    // run actions
  async run(eventName, source) {
    try {
      const request = require('request-promise-native');

      // glitch goes to sleep after 10min without requests; send request every 8min
      request("https://casa-do-sr.glitch.me/ChangeState/stayingAlive/"+ new Date().toISOString() +"/" + this._ownerKey);

    } catch (error) {
        console.error(error);
    }
  
  }

 


    // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    return new HeartbeatFlow(dbObjData, userKey);
  }
}
