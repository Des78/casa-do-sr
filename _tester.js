
// debug testing & experimenting stuff

  exports.testObjModel = () => {

    const storage = require('node-persist');

    storage.initSync({dir: ".data/userX/db/things"});

    storage.setItemSync("Test", "42");

    console.log();
    console.log("--- object test ---");
    console.log();

    try {
        const Thing = require('./model/Thing');
      
        let thing = new Thing("MyThing", "TestGroup", null);
        //let thing = Thing.createInstance(storage.getItemSync("MyThing"));
        console.log(thing);
        console.log(thing.name + " state: " + thing.state);
        storage.setItemSync(thing.name, thing);
        thing.state = "OFF";
        console.log(thing.name + " state: " + thing.state);
    }
    catch (err)
    {
        console.error("ERROR: " + err);
    }
    console.log();

    try {
        const ToggleSwitch = require('./model/ToogleThing');
      
        let toogle = new ToggleSwitch("MySwitch", "TestGroup", null);
        console.log(toogle);
        console.log(toogle.name + " state: " + toogle.state);
        toogle.toogle();
        console.log(toogle.name + " state: " + toogle.state);
        toogle.state = "OFF";
        console.log(toogle.name + " state: " + toogle.state);
        console.log("Save to DB");
        storage.setItemSync(toogle.name, toogle);
        toogle.toogle();
        console.log(toogle.name + " state: " + toogle.state);
        console.log("Update to DB");
        storage.setItemSync(toogle.name, toogle);

        console.log("Read from to DB");
        toogle = storage.getItemSync(toogle.name);
        console.log(toogle);
        console.log(toogle.name + " state: " + toogle.state);
        toogle.state = "XPTO";
        console.log(toogle.name + " state: " + toogle.state);
    }
    catch (err)
    {
        console.error("ERROR: " + err);
    }
    console.log();

    try {
        const Shutter = require('./model/ProgressiveThing');
      
        let shutter = new Shutter("MyShutter", "TestGroup", 0.25, 20);
        console.log(shutter);
        console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress + " | isIncreasing: " + shutter._isIncreasing + " StartTime: " + new Date(shutter._startDate).toLocaleTimeString());
        shutter.state = 1;
        console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress + " | isIncreasing: " + shutter._isIncreasing + " StartTime: " + new Date(shutter._startDate).toLocaleTimeString());
        shutter.state = 0;
        console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress + " | isIncreasing: " + shutter._isIncreasing + " StartTime: " + new Date(shutter._startDate).toLocaleTimeString());
        storage.setItemSync(shutter.name, shutter);

        console.log("Start Increasing");
        shutter.startIncreasing();
        console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress + " | isIncreasing: " + shutter._isIncreasing + " StartTime: " + new Date(shutter._startDate).toLocaleTimeString() + " - " + new Date().toLocaleTimeString());
        setTimeout(() => {
            shutter.calculateProgress();
            console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress + " | isIncreasing: " + shutter._isIncreasing + " StartTime: " + new Date(shutter._startDate).toLocaleTimeString() + " - " + new Date().toLocaleTimeString());
        }, 1000);
        setTimeout(() => {
            shutter.calculateProgress();
            console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress + " | isIncreasing: " + shutter._isIncreasing + " StartTime: " + new Date(shutter._startDate).toLocaleTimeString() + " - " + new Date().toLocaleTimeString());
        }, 2000);
        setTimeout(() => {
            shutter.calculateProgress();
            console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress + " | isIncreasing: " + shutter._isIncreasing + " StartTime: " + new Date(shutter._startDate).toLocaleTimeString() + " - " + new Date().toLocaleTimeString());
        }, 3000);
        setTimeout(() => {
            shutter.calculateProgress();
            console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress + " | isIncreasing: " + shutter._isIncreasing + " StartTime: " + new Date(shutter._startDate).toLocaleTimeString() + " - " + new Date().toLocaleTimeString());
        }, 4000);
        setTimeout(() => {
            console.log("Stop Increasing");
            shutter.stopIncreaseing();
            storage.setItemSync(shutter.name, shutter);
            console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress + " | isIncreasing: " + shutter._isIncreasing + " StartTime: " + new Date(shutter._startDate).toLocaleTimeString());
        }, 5500);
        setTimeout(() => {
            shutter.calculateProgress();
            console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress + " | isIncreasing: " + shutter._isIncreasing + " StartTime: " + new Date(shutter._startDate).toLocaleTimeString());
        }, 7000);

        //shutter.state = "1";
        //console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress);
        shutter.state = 0.99;
        console.log(shutter.name + " state: " + shutter.state + " / " + shutter.progress);
    }
    catch (err)
    {
        console.error("ERROR: " + err);
    }
    storage.persistSync();

    console.log();
    console.log("--- END ---");
    console.log();
  }



  exports.createTestData = () => {

    console.log();
    console.log("--- create test data ---");
    console.log();


    console.log("init");
    const persistMgr = require('./services/persistenceManager')

    try {
        console.log("create user 1");
        //persistMgr.createUser("xpto@gmail.com", "google", "")
        persistMgr.createUser("des", "local", "xpto", "54h0ip1a0v073xm4g2rbqcse0d")
    }
    catch (err)
    {
        console.warn("ERROR: " + err);
        console.log("deleting user");
        //persistMgr.deleteUser("xpto@gmail.com")
        persistMgr.deleteUser("des")
    }
    try {
        console.log("create user 2");
        persistMgr.createUser("ZeManel", "local", "ogandipaugandi")
    }
    catch (err)
    {
        console.warn("ERROR [ignored]: " + err);
    }


 
    console.log();
    console.log("--- END ---");
    console.log();
  }
