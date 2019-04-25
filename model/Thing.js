
//private vars
//const _state = new WeakMap();

module.exports = class Thing {

  constructor(name, group, initialState, defaultState, iftttConnected, userKey) {
      this.name = name;
      this.group = group;
      this.state = initialState;
      this.iftttConnected = iftttConnected;
      this._ownerKey = userKey;
      this._defaultState = defaultState;
      this._type = this.constructor.name;
    }

    get posibleStates()  { return []; }
    get defaultState()  { return this._defaultState; }

    get state()  { return this._state; /* _state.get(this);*/ }
    set state(val)  { 
      if (this.posibleStates.indexOf(val) >= 0 || !val)
      {
        //_state.set(this, val);
        this._state = val;        
        
        // TODO: Persist object?
      }
      else
        throw("Invalid state '" + val + "'; Allowed states: " + this.posibleStates );
    }

    reset() {
      // reset state
      this.state = this.defaultState;
    }

    // returs number of properties merged; 0 if objects are equivalent; or -1 if merge failed
    merge(thing) {
      let res = -1;
      if (this.name === thing.name && this._type === thing._type) {
        res = 0;
        if (thing.group && thing.group != this.group) {
          this.group = thing.group;
          res++;
        }
        if (thing._state && thing._state != this._state) {
          this._state = thing._state;
          res++;
        }
        if (thing._defaultState && thing._defaultState != this._defaultState) {
          this._defaultState = thing._defaultState;
          res++;
        }
      }

      return res;
    }

    // Create a new object instance, based on persisted object data (with properties only)
    static createInstance(dbObjData, userKey) {
      return new Thing(dbObjData.name, dbObjData.group, 
        (dbObjData.initialState? dbObjData.initialState: dbObjData._state), 
        (dbObjData.defaultState? dbObjData.defaultState: dbObjData._defaultState),
        dbObjData.iftttConnected, userKey);
    }
}
