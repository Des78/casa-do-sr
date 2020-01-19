
var Workflow = require('./Workflow');

const tempColdEvent = "state:TempHumSwitch_on";
const tempHotEvent = "state:TempHumSwitch_off";
const preHeatMorningEvent = "timeDst:0630";
const preHeatEveningEvent = "timeDst:1815";


module.exports = class TemperatureControl extends Workflow {

    // events that trigger evaluation and execution of this workflow
  get triggers()  { return [tempColdEvent, tempHotEvent, preHeatMorningEvent, preHeatEveningEvent]; }

    // evaluate if it can be run
  evaluate(eventName, source) {
    const util = require('../services/utilities');   
    const persistMgr = require('../services/persistenceManager');
  
    let res = super.evaluate(eventName, source);

    if (eventName !== tempHotEvent)
    {
      let isOnVacations = persistMgr.getThing("onVacations", this._ownerKey).state;
      let temperatureMode = persistMgr.getThing("temperatureMode", this._ownerKey).state;

      if (isOnVacations || temperatureMode === "summer") 
      {
        // never turn on heating during vacations or summer
        res = false;
      }
      else 
      {
        if (eventName === "run")
        {
          // don't auto turn on heating on weekdays between 10 and 18h
          let now = new Date();
          let dayOfWeek = now.getDay(); // sunday = 0; saturday = 6
            // TODO: Get offset from user config; see https://momentjs.com/timezone/docs/
          let userLocalHour = now.getUTCHours() + 0 + (util.isDst()? 1: 0);

          res = res && (dayOfWeek === 0 ||  dayOfWeek === 6 || (userLocalHour < 10 || userLocalHour >= 18));
        }
      }
    }
    return res;
  }


    // run actions
  async run(eventName, source) {
    try {
      const util = require('../services/utilities');   
      const persistMgr = require('../services/persistenceManager');

      await util.delay(2000);

      let isCold = (persistMgr.getThing("TempHumSwitch", this._ownerKey).state === "on");

      if (isCold)
        await this.changeThingStateIfttt("Heating", "on");
      else
        await this.changeThingStateIfttt("Heating", "off");

    } catch (error) {
        console.error(error);
    }
  
  }

 

    // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    return new TemperatureControl(dbObjData, userKey);
  }
}
