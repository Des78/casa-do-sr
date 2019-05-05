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
        let errMsg = err.responseJSON? err.responseJSON.resultSummary: err.responseText;
        if (err.responseJSON.resultMessages)
          err.responseJSON.resultMessages.forEach(msg => { errMsg += "\n  " + msg; });
        alert(err.status + " - " + err.statusText + "\n" + errMsg);
        console.log(err.responseJSON? err.responseJSON: err);
        // refresh
        setTimeout(() => { showUserThings(currentUserKey); }, 1000); 
      }
  });
}

