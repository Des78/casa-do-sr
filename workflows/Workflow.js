
const eventMgr = require('../services/eventManager');
const stateMgr = require('../services/stateManager');
const iftttMgr = require('../services/ifttt');

module.exports = class Workflow {

  constructor(wfData, userKey) {
      this.name = wfData.name;

      this._ownerKey = userKey;
      this.init();
    }

    // events that trigger evaluation and execution of this workflow
    get triggers()  { return []; }

    // initialize trigger events
    init() {
      this.triggers.forEach((trigger) => {
        eventMgr.subscribe(trigger, (source) => { 
          if (this.evaluate(trigger, source))
            this.run(trigger, source);
        });
      });      
    }

          
      // evaluate if it can be run
    evaluate(eventName, source) {
      // to be overriden in child classes
      return true;
    }
  
      // run actions
    async run(eventName, source) {
      // to be overriden in child classes
    }


    changeThingState(thingName, state) {
      stateMgr.changeState(thingName, state, this._ownerKey, "internal");
    }
  
    async changeThingStateIfttt(thingName, state) {
      let resultObj = await iftttMgr.launchTriggerEvents([thingName+"_"+state], this._ownerKey);
  
      if (resultObj && (resultObj.errorCode === 0 || resultObj.errorCode === 200)) {
        this.changeThingState(thingName, state);
      }
    }
  
    async changeIftttProgThingToTarget(thingName, targetProgress) {
      const util = require('../services/utilities');   
      const persistMgr = require('../services/persistenceManager');

      let progThing = persistMgr.getThing(thingName, this._ownerKey);
      let progDiff = targetProgress - progThing.progress;
      const tolerance = 0.10;
      if (Math.abs(progDiff) > tolerance) 
      {
        let direction = (progDiff > 0)? "inc": "dec";
        let durationMs = Math.round(Math.abs(progDiff * progThing.executionSecs) * 1000);
  
        console.log("Changing " + thingName + " progress from " + (progThing.progress*100) + "% to " + (targetProgress*100) + "% for " + (durationMs/1000) + "secs.");
        await this.changeThingStateIfttt(thingName + "-_-" + direction, "on");
        await util.delay(durationMs);
        await this.changeThingStateIfttt(thingName + "-_-" + direction, "off");
      }
      else
        console.log("Skipping " + thingName + " progress from " + (progThing.progress*100) + "% to " + (targetProgress*100) + "% (difference too small)");
    }
  

    // Create a new object instance, based on persisted object data (with properties only)
    static createInstance(dbObjData, userKey) {
      return new Workflow(dbObjData, userKey);
    }
}
