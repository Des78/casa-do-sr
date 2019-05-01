// controllers/things.js
'use strict';

const Thing = require('../model/Thing');
const ToogleThing = require('../model/ToogleThing');
const ProgressiveThing = require('../model/ProgressiveThing');

exports.list = (req, res) => {

  const util = require('../services/utilities');
  const userKey = util.getParam(req, "user");
  
  const persistMgr = require('../services/persistenceManager');

  let tplData = {};

  let things = persistMgr.getUserThings(userKey);
  // sort by group and then by name
  things = things.sort((a,b) => (a.group !== b.group)? a.group.localeCompare(b.group): a.name.localeCompare(b.name));
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
    // shallow clone - for deepclone: let thingVM = JSON.parse(JSON.stringify(thing));
    let thingVM = {...thing};
    thingVM.isToogle = thing instanceof ToogleThing;
    thingVM.isProgressive = thing instanceof ProgressiveThing;
    thingVM.isOff = thing.state === "off";
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

