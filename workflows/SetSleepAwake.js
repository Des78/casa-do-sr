
var Workflow = require('./Workflow');

const shutterOpenEvent = "state:ShutterBedroom-_-inc_on";
const shutterCloseEvent = "state:ShutterBedroom-_-dec_on";
const awakeTimeEvent = "timeDst:1230";
const asleepTimeEvent = "timeDst:0530";

module.exports = class SetSleepAwake extends Workflow {

    // events that trigger evaluation and execution of this workflow
  get triggers()  { return [shutterCloseEvent, shutterOpenEvent, awakeTimeEvent, asleepTimeEvent]; }

    // evaluate if it can be run
  evaluate(eventName, source) {
    let res = super.evaluate(eventName, source);

    /*
    let triggerSwitch = persistMgr.getThing("ShutterBedroom", this._ownerKey);
    this.triggerSwitch = triggerSwitch;

    res = res && (triggerSwitch._decreaseThing.state() === "on" || triggerSwitch._increaseThing.state() === "on");
    */
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

      let currentDateTime = new Date();
      // TODO: Get offset from user config
      let userLocalHour = currentDateTime.getUTCHours() + 0 + (util.isDst()? 1: 0);

      if (userLocalHour >= 6 && userLocalHour < 12 && (!isMasterAwake || !iswifeAwake))
      {
          // set awake

          if (source && source.name === "ShutterBedroom") {
            // turn off switches
            if (eventName === shutterOpenEvent)
            {
              await util.delay(18000);
              await this.changeThingStateIfttt("ShutterBedroom-_-inc", "off");
            }
            else 
            {
              await util.delay(4000);
              await this.changeThingStateIfttt("ShutterBedroom-_-dec", "off");
            }
          }

          if (!isMasterAwake) 
          {
            // set master awake
            this.changeThingState("masterAwake", true);

            if ((userLocalHour >= 6 && userLocalHour < 8) || temperatureMode === "summer")
            {
              // dark times, turn on office light
              await util.delay(2000);
              await this.changeThingStateIfttt("Plug01", "on");
            }
          }

          if (!iswifeAwake && (isMasterAwake || eventName === shutterOpenEvent)) 
          {
            // set wife awake
            this.changeThingState("wifeAwake", true);
          }
      }
      else if (eventName === awakeTimeEvent)
      {
        // auto set awake
        this.changeThingState("masterAwake", true);
        this.changeThingState("wifeAwake", true);
        await this.changeThingStateIfttt("Plug01", "off");
      }
      else if ((userLocalHour >= 22 || userLocalHour < 6))
      {
        // set asleep
        this.changeThingState("masterAwake", false);
        this.changeThingState("wifeAwake", false);
        await this.changeThingStateIfttt("Plug01", "off");
        await util.delay(15000);
        if (eventName === shutterCloseEvent)
          await this.changeThingStateIfttt("ShutterBedroom-_-dec", "off");
        await this.changeThingStateIfttt("LightLivRoomFloor-_-channel 1", "off");
      }

    } catch (error) {
        console.error(error);
    }
  
  }

 

    // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    return new SetSleepAwake(dbObjData, userKey);
  }
}
