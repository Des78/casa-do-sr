// client-side js
// run by the browser each time your view template is loaded


function showUserThings(user)
{
  $.get( '/thingsList', { user: user }, function(data) {
    $('#thingsList').html(data); 
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
