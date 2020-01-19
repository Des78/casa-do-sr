var Workflow = require('./Workflow');

const eveningTimeEvent = "timeDst:2142";


module.exports = class EveningFlow extends Workflow {

    // events that trigger evaluation and execution of this workflow
  get triggers()  { return [eveningTimeEvent]; }


    // run actions
  async run(eventName, source) {
    try {
      const util = require('../services/utilities');   
      const persistMgr = require('../services/persistenceManager');

      let temperatureMode = persistMgr.getThing("temperatureMode", this._ownerKey).state;
      let isOnVacations = persistMgr.getThing("onVacations", this._ownerKey).state;

      await this.changeThingStateIfttt("Plug01", "on");
      await this.changeThingStateIfttt("LightLivingRoom-_-channel 1", "off");
      await util.delay(10000);
      await this.changeIftttProgThingToTarget("ShutterOffice02", ((temperatureMode === "winter")? 0: (temperatureMode === "summer")? 0.66: 0));
      await util.delay(1000);
      await this.changeIftttProgThingToTarget("ShutterKitchenWindow", ((temperatureMode === "winter")? 0: 0.33));
      await util.delay(1000);
      await this.changeIftttProgThingToTarget("ShutterKitchenDoor", ((temperatureMode === "winter")? 0: 0.20));
      await util.delay(1000);
      await this.changeIftttProgThingToTarget("ShutterLivingRoom", ((temperatureMode === "winter")? 0: (temperatureMode === "summer")? 0.5: 0.15));
      await util.delay(1000);
      await this.changeIftttProgThingToTarget("ShutterBedroom", ((temperatureMode === "winter")? 0: (temperatureMode === "summer")? 0.5: 0));
      await this.changeThingStateIfttt("LightKitchen-_-channel 2", "off");
      await util.delay(10*60*1000);
      await this.changeIftttProgThingToTarget("ShutterOffice-R", ((temperatureMode === "winter")? 0: (temperatureMode === "summer")? 0.66: 0));
  
      if (isOnVacations) {
        await this.changeThingStateIfttt("LightLivingRoom-_-channel 3", "off");
        await this.changeIftttProgThingToTarget("ShutterBedroom", 0);
        await util.delay(1000);
        await this.changeIftttProgThingToTarget("ShutterKitchenDoor", 0);
        await util.delay(5*60*1000);
        await this.changeIftttProgThingToTarget("ShutterKitchenWindow", 0);
        await util.delay(1000);
        await this.changeIftttProgThingToTarget("ShutterOffice02", 0);
        await util.delay(30*60*1000);
        await this.changeIftttProgThingToTarget("ShutterOffice-R", 0);
        await this.changeIftttProgThingToTarget("ShutterLivingRoom", 0);
        await this.changeThingStateIfttt("LightLivRoomFloor-_-channel 1", "off");
      }

    } catch (error) {
        console.error(error);
    }
  
  }

 


    // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    return new EveningFlow(dbObjData, userKey);
  }
}
