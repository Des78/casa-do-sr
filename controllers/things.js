// controllers/things.js
'use strict';

const Thing = require('../model/Thing');
const ToogleThing = require('../model/ToogleThing');
const ProgressiveThing = require('../model/ProgressiveThing');
const VariableThing = require('../model/VariableThing');

exports.list = (req, res) => {

  const util = require('../services/utilities');
  const userKey = util.getParam(req, "user");
  
  const persistMgr = require('../services/persistenceManager');

  let tplData = {};

  let things = persistMgr.getUserThings(userKey);
  // sort by group and then by name
  things = things.sort((a,b) => (a.group !== b.group)? a.group.localeCompare(b.group): a.label.localeCompare(b.label));
  //let groups = [...new Set(things.map(t => t.group))];
  let groups = [];
  let groupIdx = -1;
  things.forEach(thing => {
    if (groupIdx < 0 || thing.group !== groups[groupIdx].name) {
      // new group
      let group = {}
      group = {};
      group.name = thing.group;
      group.things = [];
      group.showHeaders = true;
      group.showTypeHeader = false;
      group.showGroupHeader = false;     
      
      groupIdx++;
      groups[groupIdx] = group;
    }
    let thingVM = getThingViewModel(thing);

    groups[groupIdx].things.push(thingVM);
  });

  tplData.thingGroups = groups;
  tplData.partials = { 
    things: 'thingsList',
    thingStateControl: 'thingStateControl' 
  };

  // show things list
  res.render('thingGroups.mustache', tplData);
};


function getThingViewModel(thing) {
  // shallow clone - for deepclone: let thingVM = JSON.parse(JSON.stringify(thing));
  let thingVM = { ...thing };
  thingVM.isToogle = thing instanceof ToogleThing;
  thingVM.isProgressive = thing instanceof ProgressiveThing;
  thingVM.isVariable = thing instanceof VariableThing;
  thingVM.isOff = (thing.state === "off" || !thing.state);
  thingVM.isBinaryInput = true;

  if (thingVM.isProgressive) {
    thingVM.progressPercent = Math.round(thingVM.progress * 100) + "%";

    thingVM.innerThings = [];
    thingVM.innerThings.push(getThingViewModel(thing._decreaseThing));
    thingVM.innerThings.push(getThingViewModel(thing._increaseThing));
  }
  else 
    thingVM.innerThings = "self";

  if (thingVM.isVariable) {
    switch (thing.variableType) {
      case "boolean":
        thingVM.isBinaryInput = true;
        thingVM.isTextInput = false;
        thingVM.inputType = "checkbox";
        break;
    
      case "number":
        thingVM.isBinaryInput = false;
        thingVM.isTextInput = true;
        thingVM.inputType = "number";
        break;

      case "string":
      default:
        thingVM.isBinaryInput = false;
        thingVM.isTextInput = true;
        thingVM.inputType = "text";
        break;
    }
  }
  
  return thingVM;
}

