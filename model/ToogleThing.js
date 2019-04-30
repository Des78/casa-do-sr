
var Thing = require('./Thing');

module.exports = class ToogleThing extends Thing {

  get posibleStates()  { return ["on", "off"]; }
  get defaultState()  { return (this._defaultState)? this._defaultState: "off"; }

  get state()  { return super.state; }
  set state(val)  { 
    super.state = val;
    if (this.state === "off" || !this.state)
      this.nextState = "on";
    else
      this.nextState = "off";
  }


  toogle() {
    if (this.state === "off" || !this.state)
      this.state = "on";
    else
      this.state = "off";
  }

    // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    return new ToogleThing(dbObjData, userKey);
  }
}
