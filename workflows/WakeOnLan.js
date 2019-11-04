var Workflow = require('./Workflow');

const pcOnRequest = "state:MainPc_on";


module.exports = class WakeOnLan extends Workflow {

    // events that trigger evaluation and execution of this workflow
  get triggers()  { return [pcOnRequest]; }


    // run actions
  async run(eventName, source) {
    try {
 
      var wol = require('node-wol');
 
      // TODO: Make PC address configurable in PC Thing
      wol.wake('00:25:22:34:30:F3', {
        address: 'desecrate.ddns.net',
        port: 7
      }, function(error) {
        if(error) {
          console.error(error);
          return;
        }
      });
      
    } catch (error) {
        console.error(error);
    }
  
  }

 


    // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    return new WakeOnLan(dbObjData, userKey);
  }
}
