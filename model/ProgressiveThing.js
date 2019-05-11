
const Thing = require('./Thing');
const ToogleThing = require('./ToogleThing');
const InnerThingSeparator = "-_-";

//private vars
//const _state = new WeakMap();

// Composed thing that uses two toggle things to increase/decrease progress
// e.g. an electric blind/shutter or garage door with up and down switches
module.exports = class ProgressiveThing extends Thing {

  constructor(thingData, userKey) {
    super(thingData, userKey);
    this.progress = thingData.progress? thingData.progress: 0;
    this.executionSecs = thingData.executionSecs;

    // switches for up/down; open/close; forward/backward; etc
    this._increaseThing = ToogleThing.createInstance((thingData._increaseThing? thingData._increaseThing : this._generateInternalThingData(thingData, "inc")), userKey);
    this._decreaseThing = ToogleThing.createInstance((thingData._decreaseThing? thingData._decreaseThing : this._generateInternalThingData(thingData, "dec")), userKey);
    // aux variables to calculate progress
    this._initialProgress = (thingData._initialProgress !== null && '_initialProgress' in thingData)? thingData._initialProgress: this.progress;
    this._startDate = (thingData._startDate != null && '_startDate' in thingData)? thingData._startDate: null;
    this._isIncreasing = (thingData._isIncreasing !== null && '_isIncreasing' in thingData)? thingData._isIncreasing: null;

    // recalculate progress on init
    this._calculateProgress();
  }

  //get posibleStates()  { return [0, 0.25, 0.5, 0.75, 1]; }
  //get defaultState()  { return (this._defaultState)? this._defaultState: 0; }
  get posibleStates()  { return ["increasing", "decreasing", "off"]; }
  get defaultState()  { return (this._defaultState)? this._defaultState: "off"; }

  get state()  { return super.state; }
  set state(val)  { 
    super.state = val;

    if (val === "increasing")
      this._startIncreasing();
    else if (val === "decreasing")
      this._startDecreasing();
    else {
      // set all off
      this._stopIncreasing();
      this._stopDecreasing();
    }

    if (this.state === "off" || !this.state)
      this.nextState = [ "increasing", "decreasing" ];
    else
      this.nextState = "off";

  }
  
  // returs number of properties merged; 0 if objects are equivalent; or -1 if merge failed
  merge(thing) {
    let res = super.merge(thing);
    if (res >= 0) {
      if (thing.executionSecs !== null && thing.executionSecs != this.executionSecs) {
        this.executionSecs = thing.executionSecs;
        res++;
      }
      if (thing.progress && thing.progress != this.progress) {
        this.progress = thing.progress;
        res++;
      }
      if (thing._initialProgress && thing._initialProgress != this._initialProgress) {
        this._initialProgress = thing._initialProgress;
        res++;
      }
      if (thing._startDate && thing._startDate != this._startDate) {
        this._startDate = thing._startDate;
        res++;
      }
      if (thing._isIncreasing !== null && ('_isIncreasing' in thing) && thing._isIncreasing != this._isIncreasing) {
        this._isIncreasing = thing._isIncreasing;
        res++;
      }

      if (thing._increaseThing && thing._increaseThing.state && thing._increaseThing.state != "off") {
        res += this._increaseThing.merge(thing._increaseThing);
      }
      if (thing._decreaseThing && thing._decreaseThing.state && thing._decreaseThing.state != "off") {
        res += this._decreaseThing.merge(thing._decreaseThing);
      }
      
    }

    return res;
  }

  // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    const instance = new ProgressiveThing(dbObjData, userKey);

    return instance;
  }


  
  getParentStateForInnerStateChange(innerThingName, newState) 
  {
    let newParentState = "";
    if (innerThingName === this._increaseThing.name)
      newParentState = (newState === "on")? "increasing" : "off";

    else if (innerThingName === this._decreaseThing.name) 
      newParentState = (newState === "on")? "decreasing" : "off";

    else 
      throw("Inner thing '" + innerThingName + "' not found in " + this.name );
    
    return newParentState;
  }


  _startIncreasing() {
    if (this._increaseThing)
    {
      this._increaseThing.state = "on";
      this._initialProgress = this.progress;
      this._startDate = Date.now();
      this._isIncreasing = true;
    }
  }
  _stopIncreasing() {
    if (this._increaseThing)
    {
      this._increaseThing.state = "off";
      if (this._isIncreasing) {
        this._calculateProgress();
        this._startDate = null;
        this._isIncreasing = null;
      }
    }
  }

  _startDecreasing() {
    if (this._decreaseThing)
    {
      this._decreaseThing.state = "on";
      this._initialProgress = this.progress;
      this._startDate = Date.now();
      this._isIncreasing = false;
    }
  }
  _stopDecreasing() {
    if (this._decreaseThing)
    {
      this._decreaseThing.state = "off";
      if (this._isIncreasing === false) {
        this._calculateProgress();
        this._startDate = null;
        this._isIncreasing = null;
      }
    }
  }

  // progress is between 0 and 1
  _calculateProgress() {
    if (this._startDate && (this._isIncreasing !== null)) {
      let secs = (Date.now() - this._startDate)/1000;
      let amountOfProgress = (this.executionSecs > 0)? Math.round(100*(secs/this.executionSecs))/100 : 1;
      if (!this._isIncreasing)
        amountOfProgress = -amountOfProgress;

      let tmpProgress = this._initialProgress + amountOfProgress;
      this.progress = (tmpProgress > 1)? 1: ((tmpProgress < 0)? 0: tmpProgress);
    }

    return this.progress;
  }


  _generateInternalThingData(parentData, sufix) {
    let thingData = {
      "name": parentData.name + InnerThingSeparator + sufix,
      "group": parentData.group+"[internal]", 
      "initialState": "off", 
      "defaultState": "off", 
      "iftttConnected": parentData.iftttConnected,
      "parentThing": parentData.name
    }
    
    return thingData;
  }


}
