var Workflow = require('./Workflow');


module.exports = class TestFlow extends Workflow {

    // events that trigger evaluation and execution of this workflow
  get triggers()  { return []; }


    // run actions
  async run(eventName, source) {
    try {
      const util = require('../services/utilities');   

      await this.changeThingStateIfttt("Plug01", "off");
      await util.delay(2000);
      await this.changeIftttProgThingToTarget("ShutterOffice-R", 0.75);
      await util.delay(2000);
      await this.changeIftttProgThingToTarget("ShutterOffice-R", 0.33);
      await util.delay(2000);
      await this.changeIftttProgThingToTarget("ShutterOffice-R", 0);
      await this.changeThingStateIfttt("Plug01", "on");

    } catch (error) {
        console.error(error);
    }
  
  }

 


    // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    return new TestFlow(dbObjData, userKey);
  }
}
