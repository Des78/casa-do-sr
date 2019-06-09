
var Thing = require('./Thing');

module.exports = class VariableThing extends Thing {

  constructor(thingData, userKey) {
    super(thingData, userKey);
    this.variableType = thingData.variableType? thingData.variableType: "string";
    // reset state based on variable type logic
    this.state = (thingData._state !== null && thingData._state !== undefined)? thingData._state: thingData.initialState;
  }


  get state()  { return super.state; }
  set state(val)  { 

    let isValid = true;
    let nextState = null;
    switch (this.variableType) {
      case "boolean":
        if (val === "true")
          val = true;
        else if (val === "false")
          val = false;
        isValid = (typeof val === "boolean" || val === null || val === undefined)
        if (!val)
          nextState = true;
        else
          nextState = false;
        break;

      case "number":
        if (val != null && val != undefined)
          val = Number(val);
        isValid = !isNaN(val) || val === null || val === undefined;
        break;
    
      default:
        // string
        break;
    }

    if (!isValid)
      throw("Invalid value '" + val + "' for variable '"+this.name+"' type " + this.variableType);

      // bypass parent class state validation
    //super.state = val;
    this._state = val;
    this.nextState = nextState;
  }

  // returs number of properties merged; 0 if objects are equivalent; or -1 if merge failed
  merge(thing) {
    let res = super.merge(thing);
    if (res >= 0) {
      if (thing.variableType !== null && thing.variableType != this.variableType) {
        this.variableType = thing.variableType;
        res++;
      }
    }
    return res;
  }

    // Create a new object instance, based on persisted object data (with properties only)
  static createInstance(dbObjData, userKey) {
    return new VariableThing(dbObjData, userKey);
  }
}
