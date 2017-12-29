There are two stages to setting up multiple triggers in IFTTT:

# Stage 1: Triggering your Glitch app:

In IFTTT, create a new applet by selecting 'New Applet'.

For the 'if' condition, select whatever service notification you want to initially trigger your Glitch app. I'm going to use 'Button widget' with the ‘button press’ action, so I can trigger things from my iPhone’s lock screen.

For the 'then' condition, search and select 'Webhooks', and use the 'Make a web request' action. Set the URL to your Glitch project URL - this has the format of '`https://project-name.glitch.me/`', so in this example I used 'https://multi-ifttt-triggers.glitch.me'. Set the Method to '`POST`' and Content Type to '`application/json`'. You don’t need to set anything in the ‘Body’.

e.g. ![](https://cdn.glitch.com/4761356a-9369-4e79-9d1e-a8306e8c00b5%2FiftttWebRequestSettings.png)

Now when that service triggers, Glitch will receive a request. All that's left now is to get Glitch to then trigger multiple services back in IFTTT.

# Stage 2: Setup your Glitch app to trigger multiple services:

From your [Maker settings page](https://ifttt.com/services/maker_webhooks/settings) in IFTTT, copy and paste the `URL` value for the `IFTTT_MAKER_URL` variable into the `.env` file in your Glitch project.

![](https://cdn.glitch.com/4761356a-9369-4e79-9d1e-a8306e8c00b5%2FiftttMakerURL.png)

Then, for each service that you want your Glitch app to trigger you need to create a new applet in IFTTT. For each one:

- Create a new applet by selecting ‘New Applet’

  For the 'if' condition, search and select 'Webhooks', and use the 'Receive a web request' action. Set an event name, and set that event name against the `IFTTT_SERVICE_X` variable in the `.env` file in your Glitch project. E.g. if I created an event name called 'lights_on', I would set `IFTTT_SERVICE_1=lights_on` in `.env`.

- For the 'then' condition, search and select whatever service you want to trigger, such as turning on your lights, turning off a plug, sending an email etc. and click ‘finish’ to create the applet.

Repeat for each service. By the end your `.env` file will look a bit like:
![](https://cdn.glitch.com/4761356a-9369-4e79-9d1e-a8306e8c00b5%2FiftttEnvFile.png)

# The Result

Once done, upon receiving a request your Glitch app will trigger those multiple other triggers in IFTTT. So in this example, when I hit the IFTTT button, my lights go off, the thermostat is set to away, and my cameras are turned on, so I'm all set to go out.