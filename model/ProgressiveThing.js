
const Thing = require('./Thing');
const ToogleThing = require('./ToogleThing');

//private vars
//const _state = new WeakMap();

// Composed thing that uses two toggle things to increase/decrease progress
// e.g. an electric blind/shutter or garage door with up and down switches
module.exports = class ProgressiveThing extends Thing {

  constructor(name, group, initialState, defaultState, iftttConnected, userKey, executionSecs) {
    super(name, group, initialState, defaultState, iftttConnected, userKey);
    if (!this.progress)
      this.progress = 0;
    this.executionSecs = executionSecs;

    // switches for up/down; open/close; forward/backward; etc
    this._increaseThing = new ToogleThing(name + "-Inc", group+"-internal", "off", "off");
    this._decreaseThing = new ToogleThing(name + "-Dec", group+"-internal", "off", "off");
    // aux variables to calculate progress
    this._initialProgress = this.progress;
    this._startDate = null;
    this._isIncreasing = null;
  }

  get posibleStates()  { return [0, 0.25, 0.5, 0.75, 1]; }
  get defaultState()  { return (this._defaultState)? this._defaultState: 0; }

  get state()  { return super.state; }
  set state(val)  { 
    super.state = val;
    this.progress = val;
    //_state.set(this, val);
  }
  
  // returs number of properties merged; 0 if objects are equivalent; or -1 if merge failed
  merge(thing) {
    let res = super.merge(thing);
    if (res >= 0) {
      if (thing.executionSecs && thing.executionSecs != this.executionSecs) {
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
      if (thing._isIncreasing && thing._isIncreasing != this._isIncreasing) {
        this._isIncreasing = thing._isIncreasing;
        res++;
      }
      if (thing.progress && thing.progress != this.progress) {
        this.progress = thing.progress;
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
    const instance = new ProgressiveThing(dbObjData.name, dbObjData.group, 
      (dbObjData.initialState? dbObjData.initialState: dbObjData._state), 
      (dbObjData.defaultState? dbObjData.defaultState: dbObjData._defaultState), 
      dbObjData.iftttConnected, userKey,
      dbObjData.executionSecs);
      
    if (dbObjData._increaseThing)
      instance._increaseThing = ToogleThing.createInstance(dbObjData._increaseThing);
    if (dbObjData._decreaseThing)
      instance._decreaseThing = ToogleThing.createInstance(dbObjData._decreaseThing);
    if (dbObjData.progress)
      instance.progress = dbObjData.progress;
    if (dbObjData._initialProgress)
      instance._initialProgress = dbObjData._initialProgress;
    if (dbObjData._startDate)
      instance._startDate = dbObjData._startDate;
    if (dbObjData._isIncreasing)
      instance._isIncreasing = dbObjData._isIncreasing;

    return instance;
  }


  startIncreasing() {
    this._increaseThing.state = "on";
    this._initialProgress = this.progress;
    this._startDate = Date.now();
    this._isIncreasing = true;
  }
  stopIncreaseing() {
    this._increaseThing.state = "off";
    if (this._isIncreasing) {
      this.calculateProgress();
      this._startDate = null;
      this._isIncreasing = null;
    }
  }

  startDecreasing() {
    this._decreaseThing.state = "on";
    this._initialProgress = this.progress;
    this._startDate = Date.now();
    this._isIncreasing = false;
  }
  stopDecreaseing() {
    this._decreaseThing.state = "off";
    if (this._isIncreasing === false) {
      this.calculateProgress();
      this._startDate = null;
      this._isIncreasing = null;
    }
  }

  // progress is between 0 and 1
  calculateProgress() {
    if (this._startDate && (this._isIncreasing !== null)) {
      let secs = (Date.now() - this._startDate)/1000;
      let amountOfProgress = (this.executionSecs > 0)? Math.round(100*(secs/this.executionSecs))/100 : 1;
      if (!this._isIncreasing)
        amountOfProgress = -amountOfProgress;

      let tmpProgress = this._initialProgress + amountOfProgress;
      this.progress = (tmpProgress > 1)? 1: ((tmpProgress < 0)? 0: tmpProgress);

      // find closest discrete state value
      let minDiff = 1;
      let closestStateIdx = 0;
      for (let i = 0; i < this.posibleStates.length; i++) {
        let curDiff = Math.abs(this.posibleStates[i] - this.progress);
        if (curDiff < minDiff) {
          minDiff = curDiff;
          closestStateIdx = i;
        }
      }
      //_state.set(this, this.posibleStates[closestStateIdx]);
      this._state = this.posibleStates[closestStateIdx];
    }

    return this.progress;
  }

  
}
