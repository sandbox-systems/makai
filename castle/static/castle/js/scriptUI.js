$( document ).ready(function() {
    // TODO Details Function
    $( function() {
        $( document ).tooltip();
    } );

    $('a[data-action="Details"]').click(function() {

        //Repository Details
        let title = window.repos[window.currId].name;
        let description = window.repos[window.currId].description===""?"No Description..."
            :window.repos[window.currId].description;
        let owner = "<i class='fas fa-user'></i> " + window.repos[window.currId].owner;
        let privacy = window.repos[window.currId].is_private ? "<i class='fas fa-lock' " +
            "></i> Private" : "<i class='fas fa-lock' style='color: rebeccapurple'></i> Public";
        let language = "JavaScript";
        let filesize = "32.67 MB";

        //Timestamp TODO Bitbucket Timestamp %S doesn't accept double values
        let strictIsoParse = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
        let date = strictIsoParse(window.repos[window.currId].updated_on)
        let formatTime = d3.timeFormat("%B %d, %Y");
        let formatToolTip = d3.timeFormat("Updated on %B %d, %Y at %H:%M");
        let timestamp = formatTime(date);
        let tooltip = formatToolTip(date);

        let host = window.repos[window.currId].host==="github" ? "<i class='fab fa-github'></i> Github"
            : "<i class='fab fa-bitbucket'></i> Bitbucket" ;

        Swal.fire({
         title: title,
         html: "<div><p>" + description + "</p><hr><row><h5><span class='col-sm-6'>" + owner +
             "</span><span class='col-sm-6'>" + privacy + "</span></h5></row><hr>" +
             "<span class='col-sm-4'><i class='fas fa-code'></i> " + language + "</span>" +
             "<span class='col-sm-4'><i class='fas fa-folder-open'></i> " + filesize + "</span>" +
             "<span class='col-sm-4' title='" + tooltip + "'><i class='far fa-calendar-alt'></i> " + timestamp + "</span><hr>" +
             host + "</div>",
         type: "info",
         showCloseButton: true,
         closeButtonAriaLabel: "Close Repository Details",
         showConfirmButton: false
        });
    });

    // TODO Rename Function
    $('a[data-action="Rename"]').click(async function(){
        const {value: name} = await Swal.fire({
          title: 'Rename Repository',
          text: 'Enter the new name below',
          input: 'text',
          inputPlaceholder: 'Repository Name',
          inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off'
          },
          showCancelButton: true,
          confirmButtonText: "Rename",
          cancelButtonText: "Cancel",
          confirmButtonColor: '#663399'
        })
        if(name) {
          // TODO Server Side Renaming
          Swal.fire({
              title: 'Renamed!',
              text: 'The Repository has been renamed to ' + name,
              type: 'success',
              confirmButtonColor: '#663399'
          })
        }
        else {
            Swal.fire({
                 title: 'Rename Cancelled!',
                 text: 'The Repository has not been renamed',
                 type: 'error',
                 confirmButtonColor: '#663399'
            })
        }
    });

    // TODO Edit Description Function
    $('a[data-action="Edit Description"]').click(async function(){
        const {value: name} = await Swal.fire({
          title: 'Edit Description',
          text: 'Enter the new description below',
          input: 'textarea',
          // TODO Former Description?
          inputPlaceholder: 'Description...',
          inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off'
          },
          showCancelButton: true,
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          confirmButtonColor: '#663399'
        });
        if(name) {
          // TODO Server Side Edit Desc.
          Swal.fire({
              title: 'Description Changed!',
              text: "The Repository's description has been changed",
              type: 'success',
              confirmButtonColor: '#663399'
          })
        }
        else {
            Swal.fire({
                 title: 'Description Unchanged!',
                 text: "The Repository's description has not been changed",
                 type: 'error',
                 confirmButtonColor: '#663399'
            })
        }
    });

    // TODO Share Function

    // TODO Delete Function
    $('a[data-action="Delete"]').click(function(){
     Swal.fire({
         title: 'Confirm Deletion',
         text: 'Are you sure you want to delete this repository?',
         type: 'warning',
         showCancelButton: true,
         confirmButtonText: "Delete",
         cancelButtonText: "Cancel",
         confirmButtonColor: '#663399'
     }).then((result) => {
         if(result.value) {
             // TODO Server side deletion
             Swal.fire(
             {
                 title: 'Deleted!',
                 text: 'The Repository has been deleted.',
                 type: 'success',
                 confirmButtonColor: '#663399'
             })
         } else {
             Swal.fire(
             {
                 title: 'Delete Cancelled!',
                 text: 'The Repository has not been deleted',
                 type: 'error',
                 confirmButtonColor: '#663399'
             })
         }
     });
  });
});