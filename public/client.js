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

function iftttSubmit(formId, chkbox){
  // disable button while request is being processed
  chkbox.checked = !chkbox.checked;
  chkbox.disabled = true;
  $.post({
      url:'/ifttt',
      type:'post',
      data:$('#'+formId).serialize(),
      success:function(result) {
        // reactivate button and confirm change
        chkbox.disabled = false;
        chkbox.checked = !chkbox.checked;
        //alert(result);
        // refresh
        setTimeout(() => { showUserThings(currentUserKey); }, 1000); 
      },
      error:function(err) {
        // reactivate button and revert change
        chkbox.disabled = false;
        //button.checked = !button.checked;
        alert(err.status + " - " + err.statusText + "\n" + err.responseText);
        // refresh
        setTimeout(() => { showUserThings(currentUserKey); }, 1000); 
      }
  });
}

