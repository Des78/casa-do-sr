// client-side js
// run by the browser each time your view template is loaded

var currentUserKey;

// load first user things at start up
showUserThings($('#userList').find(":selected").val());


function showUserThings(userKey)
{
  currentUserKey=userKey;
  $.get( '/thingsList', { user: userKey }, function(data) {
    $('#thingsList').html(data); 
  });
}

function iftttSubmit(formId){
  $.post({
      url:'/ifttt',
      type:'post',
      data:$('#'+formId).serialize(),
      success:function(result){
          //alert(result);
          // refresh
          showUserThings(currentUserKey);
        },
      error:function(err){
        alert(err.status + " - " + err.statusText + "\n" + err.responseText);
        // refresh
        showUserThings(currentUserKey);
    }
  });
}

/*
function turnLightsOn()
{
  $.post('/LightsOn');
  alert("ON");
}

function turnLightsOff()
{
  //alert("SwitchingOff");
  $.post('/LightsOut');
  alert("OFF");
}

function triggerTest()
{
  $.post('/test');
}
*/
