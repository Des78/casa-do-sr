var Workflow = require('./Workflow');

const sunshiftEvent = "timeDst:1126"; //"astro:azimuth=120";


module.exports = class SunshiftFlow extends Workflow {

    // events that trigger evaluation and execution of this workflow
  get triggers()  { return [sunshiftEvent]; }
  

    // run actions
  async run(eventName, source) {
    try {
      const util = require('../services/utilities');   
      const persistMgr = require('../services/persistenceManager');

      let temperatureMode = persistMgr.getThing("temperatureMode", this._ownerKey).state;
      let isMasterAwake = persistMgr.getThing("masterAwake", this._ownerKey).state;
      let iswifeAwake = persistMgr.getThing("wifeAwake", this._ownerKey).state;
      let isOnVacations = persistMgr.getThing("onVacations", this._ownerKey).state;

      // azimuth 120 - sun shines on bedroom window
      if (isOnVacations || (isMasterAwake && iswifeAwake)) {
        await this.changeIftttProgThingToTarget("ShutterBedroom", ((temperatureMode === "winter")? 1: (temperatureMode === "summer")? 0: 0.33));
      }
      // azimuth 132 (30-70min after) - sun stops shining on offices
      await util.delay(30*60*1000);
      await this.changeIftttProgThingToTarget("ShutterOffice-R", ((temperatureMode === "winter")? 1: (temperatureMode === "summer")? 0.33: 0.66));
      await this.changeThingStateIfttt("Plug01", "off");
      await util.delay(10000);
      await this.changeIftttProgThingToTarget("ShutterOffice02", ((temperatureMode === "winter")? 1: (temperatureMode === "summer")? 0.33: 0.66));    

      // azimuth 135 (10-15min after) - sun shines on kitchen window
      await util.delay(10*60*1000);
      await this.changeIftttProgThingToTarget("ShutterKitchenWindow",  ((temperatureMode === "winter")? 1: (temperatureMode === "summer")? 0: 0.33));
      if (temperatureMode !== "winter") {
        // open 2nd part of office shutters (30min after)
        await this.changeIftttProgThingToTarget("ShutterOffice-R", ((temperatureMode === "summer")? 0.66: 1));  
        await util.delay(5000);
        await this.changeIftttProgThingToTarget("ShutterOffice02", ((temperatureMode === "summer")? 0.66: 1));  
      }

      // azimuth 140 (20-25min after) - sun shines on kitchen door
      await util.delay(20*60*1000);
      await this.changeIftttProgThingToTarget("ShutterKitchenDoor", ((temperatureMode === "winter")? 0.5: (temperatureMode === "summer")? 0: 0.5));

      // azimuth 240 (3h after) - in summer, sun lowers and shines on living room
      if (temperatureMode === "summer") {
        await util.delay(3*60*60*1000);
        await this.changeIftttProgThingToTarget("ShutterLivingRoom", 0);
      }

    } catch (error) {
        console.error(error);
    }
  
  }

 


    // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    return new SunshiftFlow(dbObjData, userKey);
  }
}
