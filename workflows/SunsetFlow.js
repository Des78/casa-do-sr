var Workflow = require('./Workflow');

const sunsetEvent = "timeDst:2030"; //"astro:sunset";


module.exports = class SunsetFlow extends Workflow {

    // events that trigger evaluation and execution of this workflow
  get triggers()  { return [sunsetEvent]; }


    // run actions
  async run(eventName, source) {
    try {
      const util = require('../services/utilities');   
      const persistMgr = require('../services/persistenceManager');

      let temperatureMode = persistMgr.getThing("temperatureMode", this._ownerKey).state;
      let isOnVacations = persistMgr.getThing("onVacations", this._ownerKey).state;

      await this.changeThingStateIfttt("LightLivRoomFloor-_-channel 1", "on");
      await this.changeIftttProgThingToTarget("ShutterOffice-R", ((temperatureMode === "winter")? 0: 0.66));
      await util.delay(10000);
      await this.changeIftttProgThingToTarget("ShutterOffice02", ((temperatureMode === "winter")? 0: 0.66));
      await util.delay(1000);
      await this.changeIftttProgThingToTarget("ShutterKitchenWindow", ((temperatureMode === "winter")? 0: 0.33));
      await util.delay(1000);
      await this.changeIftttProgThingToTarget("ShutterKitchenDoor", ((temperatureMode === "winter")? 0: 0.5));
      await util.delay(1000);
      await this.changeIftttProgThingToTarget("ShutterLivingRoom", ((temperatureMode === "winter")? 0: (temperatureMode === "summer")? 0.5: 0.75));
      await util.delay(1000);
      await this.changeIftttProgThingToTarget("ShutterBedroom", ((temperatureMode === "winter")? 0: (temperatureMode === "summer")? 1: 0.66));
      await util.delay(60000);
      await this.changeThingStateIfttt("LightKitchen-_-channel 2", "on");
  
      if (isOnVacations) {
        await this.changeThingStateIfttt("Plug01", "on");
        await util.delay(10*60*1000);
        await this.changeIftttProgThingToTarget("ShutterOffice-R", 0.33);
        await util.delay(1000);
        await this.changeIftttProgThingToTarget("ShutterOffice02", ((temperatureMode === "winter")? 0: 0.33));
        await util.delay(1000);
        await this.changeIftttProgThingToTarget("ShutterBedroom", ((temperatureMode === "winter")? 0: 0.33));
        await util.delay(1000);
        await this.changeIftttProgThingToTarget("ShutterLivingRoom", 0.25);
        await this.changeThingStateIfttt("LightLivingRoom-_-channel 3", "on");
        await util.delay(10000);
        await this.changeIftttProgThingToTarget("ShutterKitchenWindow", 0.33);
        await util.delay(1000);
        await this.changeIftttProgThingToTarget("ShutterKitchenDoor", 0.25);
      }

    } catch (error) {
        console.error(error);
    }
  
  }

 


    // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    return new SunsetFlow(dbObjData, userKey);
  }
}
