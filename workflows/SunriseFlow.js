
var Workflow = require('./Workflow');

const sunriseEvent = "astro:sunrise";
const minTimeEvent = "timeDst:0812";
const runOnDemandEvent = "run";

module.exports = class SunriseFlow extends Workflow {

    // events that trigger evaluation and execution of this workflow
  get triggers()  { return [sunriseEvent, minTimeEvent]; }

    // evaluate if it can be run
  evaluate(eventName, source) {
    const util = require('../services/utilities');   

    let res = super.evaluate(eventName, source);

    if (res && eventName !== runOnDemandEvent)
    {
      // TODO: Get offset from user config
      let userLocalHour = new Date().getUTCHours() + 0 + (util.isDst()? 1: 0);
      // TODO: Get sunrise time at user location to determine if it's daytime
      let isAfterSunrise = true;

      // trigger only if sunrise is after 8am
      res = (eventName === sunriseEvent && userLocalHour > 8);

      // trigger after 8am, only if sunrise already happened
      res = res || (eventName === minTimeEvent && isAfterSunrise);
    }

    return res;
  }


    // run actions
  async run(eventName, source) {
    try {
      const util = require('../services/utilities');   
      const persistMgr = require('../services/persistenceManager');

      let temperatureMode = persistMgr.getThing("temperatureMode", this._ownerKey).state;
      let isMasterAwake = persistMgr.getThing("masterAwake", this._ownerKey).state;
      let iswifeAwake = persistMgr.getThing("wifeAwake", this._ownerKey).state;
      let isOnVacations = persistMgr.getThing("onVacations", this._ownerKey).state;

      await this.changeIftttProgThingToTarget("ShutterOffice-R", ((temperatureMode === "winter")? 1: (temperatureMode === "summer")? 0: 0.33));
      await this.changeThingStateIfttt("Plug01", "off");
      await util.delay(10000);
      await this.changeIftttProgThingToTarget("ShutterOffice02", ((temperatureMode === "winter")? 1: (temperatureMode === "summer")? 0: 0.33));
      await util.delay(1000);
      await this.changeIftttProgThingToTarget("ShutterKitchenWindow", 1);
      await util.delay(1000);
      await this.changeIftttProgThingToTarget("ShutterKitchenDoor", 0.5);
      await util.delay(1000);
      await this.changeIftttProgThingToTarget("ShutterLivingRoom", ((temperatureMode === "summer")? 0.66: 1));

      if (isOnVacations || (isMasterAwake && iswifeAwake)) {
        await util.delay(20000);
        await this.changeIftttProgThingToTarget("ShutterBedroom", ((temperatureMode === "summer")? 0.66: 1));
      }
      
    } catch (error) {
        console.error(error);
    }
  
  }

 


    // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    return new SunriseFlow(dbObjData, userKey);
  }
}
