// Persistence layer access

// class references
const ThingFactory = require('../model/ThingFactory');

//global private vars (don't need WeakMap due to singleton instance)
const presistLib = require('node-persist');
var users = [];
var userDb = [];

class PersistenceManager {
    constructor () {
      if (!PersistenceManager.instance) {
        PersistenceManager.instance = this;
      }
      // Initialize object
      presistLib.initSync({dir: ".data/config"});
      users = presistLib.getItemSync("userList");
      users = users? users : [];

      users.forEach(function(userData) {
            // initialize user data storage
            if (userData) {
                userDb[userData.key] = presistLib.create({dir: ".data/userData/"+userData.key});
                userDb[userData.key].initSync();

                PersistenceManager.instance.syncUserObjectsConfig(userData.key);
            }
        });
    
      return PersistenceManager.instance;
    }

    // TODO: Remove method - usersData should not be exposed, for test/debug only
    _getUsersData() {
        return users;
    }

    // private (guideline only) method
    _getUserDataByName(userName) {
        let idx = users.findIndex(userData => userData && userData.name === userName);
        return (idx >= 0)? users[idx] : null;
    }

    getUserConfigEntry(userKey, configEntryName) {
        let configEntry = {};
        const settingsKey = "settings_"+userKey;
        if (userDb[userKey]) {
            let userConfig = userDb[userKey].getItemSync(settingsKey);
            configEntry = userConfig[configEntryName];
        }

        return configEntry;
    }

    getUserThings(userKey) {
        let things = [];
        const settingsKey = "settings_"+userKey;
        if (userDb[userKey]) {
            userDb[userKey].keys().forEach(key => {
                if (key != settingsKey)
                {
                    let thingData = userDb[userKey].getItemSync(key);
                    if (thingData) {
                        let thing = ThingFactory.createInstance(thingData, userKey)
                        things.push(thing);
                    }

                }
            })
        }

        return things;
    }

    getUserNameForKey(userKey) {
        let idx = users.findIndex(userData => userData.key === userKey);
        return (idx >= 0)? users[idx].name : null;
    }
    
    getThing(thingName, userKey) {
        let thing = {};
        if (userDb[userKey]) {
            let thingData = userDb[userKey].getItemSync(thingName);
            if (thingData) {
                thing = ThingFactory.createInstance(thingData, userKey)
            }
        }

        return thing;
    }

    saveThing(thing, userKey) {
        userDb[userKey].setItemSync(thing.name, thing);
    }



    createUser(userName, type, pass, key) {
        if (!this._getUserDataByName(userName)) {
            // update user list
            const userData = {name: userName, type: type, hash: hashAndSalt(pass), key: (key? key: generateKey())};
            users.push(userData);
            presistLib.setItemSync("userList", users);
            // initialize user data storage
            userDb[userData.key] = presistLib.create({dir: ".data/userData/"+userData.key});
            userDb[userData.key].initSync();
            const settingsTemplate = require("../user-config-tpl");
            userDb[userData.key].setItemSync("settings_"+userData.key, settingsTemplate);

            this.syncUserObjectsConfig(userData.key);
        }
        else
            throw("User '" + userName + "' already exists");
    }

    deleteUser(userName) {
        const userData = this._getUserDataByName(userName);
        if (userData) {
            // delete user data storage
            if (userDb[userData.key]) {
                const dir = userDb[userData.key].options.dir;
                userDb[userData.key].clearSync();
                delete userDb[userData.key];

                // detele empty user folder
                const fs = require('fs');
                fs.rmdirSync(dir);
            }
            // update users list
            users = users.filter(u => u !== userData);
            //users.splice(users.indexOf(userData), 1);
            //delete users[users.indexOf(userData)];
            presistLib.setItemSync("userList", users);
        }
        else
            throw("User '" + userName + "' not found");
    }

    checkUserPass(userName, pass) {
        let match = false;
        const userData = this._getUserDataByName(userName);
        if (userData) {
            match = this.checkHash(pass, userData.hash);
        }
        else
            throw("User '" + userName + "' not found");

        return match;
    }



    
    syncUserObjectsConfig(userKey) {
        // get user settings 
        const settingsKey = "settings_"+userKey;
        const userSettings = userDb[userKey].getItemSync(settingsKey);
        if (userSettings) {
            // compare items from the user config with the runtime object db
            userSettings.things.forEach(thingCfg => {
                let thingData = userDb[userKey].getItemSync(thingCfg.name);
                if (thingData) {
                    // Thing already exists, check if it needs to be updated
                    let oldThing = null;
                    try {
                        oldThing = ThingFactory.createInstance(thingData, userKey);
                    }
                    catch (err) {
                        console.error("Error loading " + thingData.Name + " from DB: " + err);
                        console.log("Recreating " + thingData.Name + " from config.");
                    }
                    if (oldThing) {
                        let newThing = ThingFactory.createInstance(thingCfg, userKey);
                        let mergeRes = oldThing.merge(newThing);
                        if (mergeRes > 0){
                            // save updated thing
                            userDb[userKey].setItemSync(oldThing.name, oldThing);
                        }
                        else if (mergeRes < 0) {
                            // thing could not be updated, clear it to be re-created
                            thingData = null;
                        }
                    }
                }

                if (!thingData) {
                    // create new Thing
                    let thing = ThingFactory.createInstance(thingCfg, userKey);
                    thing.reset();
                    userDb[userKey].setItemSync(thing.name, thing);
                }
            })

            // Check for deleted things
            let thingsToRemove = [];
            userDb[userKey].keys().forEach(storedThingName => {
                if (storedThingName != settingsKey && userSettings.things.findIndex(thing => thing.name === storedThingName) < 0) {
                    // Thing deleted, remove it from storage
                    thingsToRemove.push(storedThingName);
                }
            });
            thingsToRemove.forEach(storedThingName => {
                userDb[userKey].removeItem(storedThingName);
            });
        }
    }

  }
  
  const persistManager = new PersistenceManager();
  Object.freeze(persistManager);
  
  module.exports = persistManager;


// utility functions

function hashAndSalt(pass) {
    let hash = "";
    if (pass) {
        const bcrypt = require('bcrypt');
        const saltCount = 3;
        hash = bcrypt.hashSync(pass, saltCount);
    }

    return hash;
}

function checkHash(pass, hash) {
    let match = false;
    if (pass) {
        const bcrypt = require('bcrypt');
        match = bcrypt.compareSync(pass, hash);
    }

    return match;
}

function generateKey() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

