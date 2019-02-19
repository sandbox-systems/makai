$( function() {
$( ".card" ).draggable({ revert: "invalid", scroll: false, cursor: "move", cursorAt: { top: 50, left: 50 } });
});

// A $( document ).ready() block.
$( document ).ready(function() {
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
        })
        if(name) {
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
     console.log("Hello World");
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