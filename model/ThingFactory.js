const Thing = require('./Thing');
const ToogleThing = require('./ToogleThing');
const ProgressiveThing = require('./ProgressiveThing');

const thingClasses = { Thing, ToogleThing, ProgressiveThing };

exports.getThingType = function getThingType(typeName) {
  return thingClasses[typeName];
}

// dbObjData can be JSON serialized object, or config definition of the Thing
exports.createInstance = function createInstance(dbObjData, userKey) {
    return thingClasses[dbObjData._type].createInstance(dbObjData, userKey);
  }
  