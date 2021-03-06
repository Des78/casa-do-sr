// client-side js
// run by the browser each time your view template is loaded


var currentUserKey;


function showUserThings(userKey)
{
  if (currentUserKey !== userKey)
  {
    currentUserKey=userKey;
    initWs();
  }
  
  $.get( '/thingsList', { user: userKey }, function(data) {
    $('#thingsList').html(data); 
  });
}

function runWf(wfName)
{  
  log("Launching WF " + wfName);
  $.post('/runWf', { workflow: wfName, key: currentUserKey }, function(data, status) {
    log(status +": "+ data);
  });
}

function stateSubmit(formId, ctrl, targetUrl){
  // disable button while request is being processed
  ctrl.checked = !ctrl.checked;
  ctrl.disabled = true;
  $.post({
      url:targetUrl,
      type:'post',
      data:$("[id='"+formId+"']").serialize(),
      success:function(result) {
        // reactivate button and confirm change 
          // should typically be handled via web-socket - this is just a fallback solution
        if (!isWsConnected) {
          ctrl.disabled = false;
          ctrl.checked = !ctrl.checked;
          //alert(result);
          // refresh
          setTimeout(() => { showUserThings(currentUserKey); }, 1000); 
        }
      },
      error:function(err) {
        // reactivate button and revert change
        ctrl.disabled = false;
        //button.checked = !button.checked;
        let errMsg = err.responseJSON? err.responseJSON.resultSummary: err.responseText;
        if (err.responseJSON && err.responseJSON.resultMessages)
          err.responseJSON.resultMessages.forEach(msg => { errMsg += "\n  " + msg; });
        alert(err.status + " - " + err.statusText + "\n" + errMsg);
        console.log(err.responseJSON? err.responseJSON: err);
        // refresh
        setTimeout(() => { showUserThings(currentUserKey); }, 1000); 
      }
  });
}


// websocket event handlers
var ws = {};
var isWsConnected = false;
const wsProtocol = (location.protocol === 'https:')? 'wss' : 'ws';

function initWs() {
  try {
    isWsConnected = false;
    ws = new WebSocket(wsProtocol+'://'+window.location.host+'/?key='+currentUserKey);    

    ws.onopen = (e) => { log("socket open!"); isWsConnected = true; }
    // retry connection on close
    ws.onclose = (e) => { log("socket closed!"); setTimeout(() => { initWs() }, 10000); }
    // error will also trigger connection close
    ws.onerror = (e) => { log("socket error!")}

    ws.onmessage = (e) => { 
      log("message recieved: " + e.data); 
      isWsConnected = true;
    
      let msgObj = JSON.parse(e.data);
      if (!msgObj) msgObj = e.data;
    
      if (msgObj.eventName === "StateChanged") {
        //update the thing state display
        //use 'id=' instead of # to support ids with spaces
        let chkbox = $("[id='cb_"+msgObj.eventData.thing+"']")[0];
        if (chkbox) {
          chkbox.disabled = false;
          chkbox.checked = !chkbox.checked;
        }
        // refresh things list (to get nextState form data up-to-date)
        setTimeout(() => { showUserThings(currentUserKey); }, 1000); 
      }
    };

    // send regular heartbeat so that websocket doesn't timeout
    setInterval(() => { ws.send("heartbeat " + currentUserKey ) }, 60000);

  } catch (error) {
    log("error on websocket init: " + error);
  }

}



// logging
function log(msg) {
  $('#socketLog').append(new Date().toISOString() + " - " + msg + "<br>"); 
}


// toogle log display
$('#logHeader').click(function () {
  if ($('#socketLog').css("display") === "none") 
    $('#socketLog').css("display", "block");
  else
    $('#socketLog').css("display", "none");
});



// Startup

// load first user things at start up
showUserThings($('#userList').find(":selected").val());

