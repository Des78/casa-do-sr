// Event manager (singleton)

// class references
const EventEmitter = require('events');

//TODO: Make event emitter per user - so that we can't listen to events of other users

class EventManager extends EventEmitter {
    constructor () {
      if (!EventManager.instance) {
          super();
          EventManager.instance = this;

          // Initialize object
          EventManager.instance.init();
      }

      return EventManager.instance;
    }

    init() {
        this.removeAllListeners();

        if (this.timer)
          clearInterval(this.timer);
        this.timer = setInterval(this.raiseTimeEvent, 25000);
        this.name = "timer";
        this.lastTimeMinute = "";
    }    

    subscribe(eventName, eventHandler) {
      this.on(eventName, eventHandler);
    }
  
    raiseTimeEvent() {
      try {
        const util = require('../services/utilities');   

        let currentDateTime = new Date();
        let hourUTC = currentDateTime.getUTCHours();
        let minuteUTC = currentDateTime.getUTCMinutes();
        let hourDST = hourUTC + (util.isDst()? 1: 0);
        
        let eventNameUtc = "timeUtc:"+String(hourUTC).padStart(2, "0")+String(minuteUTC).padStart(2, "0");
        let eventNameDst = "timeDst:"+String(hourDST).padStart(2, "0")+String(minuteUTC).padStart(2, "0");

        let evtInstance = new EventManager();
        if (evtInstance.lastTimeMinute !== minuteUTC) {
          evtInstance.lastTimeMinute = minuteUTC;

          //add properties to this timer object
          let source = this;
          source.name = "timer";
          source.eventDateTime = currentDateTime; 

          let subscriptions = evtInstance.eventNames();
          if (subscriptions.includes(eventNameUtc)) 
            evtInstance.emit(eventNameUtc, source);
          if (subscriptions.includes(eventNameDst)) 
            evtInstance.emit(eventNameDst, source);
        }          
      } catch (error) {
        console.error(error);        
      }
    }

  }
  
  const eventManager = new EventManager();
  //Object.freeze(eventManager);
  
  module.exports = eventManager;

