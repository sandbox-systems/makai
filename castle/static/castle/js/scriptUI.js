function search() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('searchBar');
    filter = input.value.toUpperCase();
    ul = document.getElementById("card-list");
    li = ul.getElementsByClassName('card');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

async function previewRepo(id) {

    //Repository Details
    title = id;
    let description = document.getElementById(id).getAttribute("data-description") === "" ? "No Description..."
        : document.getElementById(id).getAttribute("data-description");
    let owner = "<i class='fas fa-user'></i> " + document.getElementById(id).getAttribute("data-owner");
    let privacy = document.getElementById(id).getAttribute("data-is-private") ? "<i class='fas fa-lock' " +
        "></i> Private" : "<i class='fas fa-lock' style='color: rebeccapurple'></i> Public";
    let language = document.getElementById(id).getAttribute("data-language");
    let filesize = document.getElementById(id).getAttribute("data-size");

    //Timestamp TODO Bitbucket Timestamp %S doesn't accept double values
    let strictIsoParse = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
    let date = strictIsoParse(document.getElementById(id).getAttribute("data-updated-on"))
    let formatTime = d3.timeFormat("%B %d, %Y");
    let formatToolTip = d3.timeFormat("Updated on %B %d, %Y at %H:%M");
    let timestamp = formatTime(date);
    let tooltip = formatToolTip(date);

    let host = document.getElementById(id).getAttribute("data-host") === "github" ? "<i class='fab fa-github'></i> Github"
        : "<i class='fab fa-bitbucket'></i> Bitbucket";

    Swal.fire({
        title: title,
        html: "<div><p>" + description + "</p><hr><row><h5><span class='col-sm-6'>" + owner +
            "</span><span class='col-sm-6'>" + privacy + "</span></h5></row><hr>" +
            "<span class='col-sm-4'><i class='fas fa-code'></i> " + language + "</span>" +
            "<span class='col-sm-4'><i class='fas fa-folder-open'></i> " + filesize + " KB</span>" +
            "<span class='col-sm-4' title='" + tooltip + "'><i class='far fa-calendar-alt'></i> " + timestamp + "</span><hr>" +
            host + "</div>",
        type: "info",
        showCloseButton: true,
        closeButtonAriaLabel: "Close Repository Details",
        showConfirmButton: false
    });
}

async function renameRepo(id) {
    const {value: name} = await Swal.fire({
        title: 'Rename ' + id + '',
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
    });
    if (name) {
        $.ajax({
            type: 'GET',
            url: '/castle/editRepoName',
            dataType: "json",
            data: {
                'name': id,
                'host': document.getElementById(id).getAttribute("data-host"),
                'owner': document.getElementById(id).getAttribute("data-owner"),
                'newName': name
            },
            success: function (data) {
                Swal.fire({
                    title: 'Renamed!',
                    text: 'The Repository has been renamed to ' + name,
                    type: 'success',
                    confirmButtonColor: '#663399'
                });
            }
        });
    } else {
        Swal.fire({
            title: 'Rename Cancelled!',
            text: 'The Repository has not been renamed',
            type: 'error',
            confirmButtonColor: '#663399'
        });
    }
}

async function editRepoDescription(id) {
    const {value: description} = await Swal.fire({
        title: 'Edit Description',
        text: 'Enter the new description below',
        input: 'textarea',
        inputPlaceholder: document.getElementById(id).getAttribute('data-description'),
        inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off'
        },
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        confirmButtonColor: '#663399'
    });
    if (description) {
        $.ajax({
            type: 'GET',
            url: '/castle/editRepoDes',
            dataType: "json",
            data: {
                'name': id,
                'host': document.getElementById(id).getAttribute("data-host"),
                'owner': document.getElementById(id).getAttribute("data-owner"),
                'newDes': description
            },
            success: function (data) {
                Swal.fire({
                    title: 'Renamed!',
                    text: 'The Repository has been renamed to ' + name,
                    type: 'success',
                    confirmButtonColor: '#663399'
                });
            }
        });
    } else {
        Swal.fire({
            title: 'Rename Cancelled!',
            text: id + ' has not been renamed',
            type: 'error',
            confirmButtonColor: '#663399'
        });
    }
}

// TODO Share Function
async function shareRepo(id) {
    Swal.fire({
        title: "Share " + id,
        html: "<div id='emails'></div>",
        type: "info",
        showCloseButton: true,
        closeButtonAriaLabel: "Close Repository Details",
        showConfirmButton: false
    });
    var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' +
        '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';

    $('#emails').selectize({
        persist: false,
        maxItems: null,
        valueField: 'email',
        labelField: 'name',
        searchField: ['name', 'email'],
        // options: [
        //     {email: 'brian@thirdroute.com', name: 'Brian Reavis'},
        //     {email: 'nikola@tesla.com', name: 'Nikola Tesla'},
        //     {email: 'someone@gmail.com'}
        // ],
        render: {
            item: function (item, escape) {
                return '<div>' +
                    (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
                    (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') +
                    '</div>';
            },
            option: function (item, escape) {
                var label = item.name || item.email;
                var caption = item.name ? item.email : null;
                return '<div>' +
                    '<span class="label">' + escape(label) + '</span>' +
                    (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                    '</div>';
            }
        },
        createFilter: function (input) {
            var match, regex;

            // email@address.com
            regex = new RegExp('^' + REGEX_EMAIL + '$', 'i');
            match = input.match(regex);
            if (match) return !this.options.hasOwnProperty(match[0]);

            // name <email@address.com>
            regex = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i');
            match = input.match(regex);
            if (match) return !this.options.hasOwnProperty(match[2]);

            return false;
        },
        create: function (input) {
            if ((new RegExp('^' + REGEX_EMAIL + '$', 'i')).test(input)) {
                return {email: input};
            }
            var match = input.match(new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i'));
            if (match) {
                return {
                    email: match[2],
                    name: $.trim(match[1])
                };
            }
            alert('Invalid email address.');
            return false;
        }
    });
}

async function deleteRepo(id) {
    Swal.fire({
        title: 'Confirm Deletion',
        html: 'Are you sure you want to delete <strong>' + id + '</strong>',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: '#663399'
    }).then((result) => {
            if (result.value) {
                // TODO Server side deletion
                $.ajax({
                    type: 'GET',
                    url: '/castle/deleteRepo',
                    dataType: "json",
                    data: {
                        'name': id,
                        'host': document.getElementById(id).getAttribute("data-host"),
                        'owner': document.getElementById(id).getAttribute("data-owner")
                    },
                    success: function (data) {
                        if (data.code != 204) {
                            Swal.fire(
                                {
                                    title: 'Deleted!',
                                    text: 'The Repository has been deleted.',
                                    type: 'success',
                                    confirmButtonColor: '#663399'
                                });
                        } else {
                            Swal.fire(
                                {
                                    title: 'Delete Cancelled!',
                                    text: 'The Repository has not been deleted',
                                    type: 'error',
                                    confirmButtonColor: '#663399'
                                });
                        }
                    }
                });
            } else {
                Swal.fire(
                    {
                        title: 'Delete Cancelled!',
                        text: 'The Repository has not been deleted',
                        type: 'error',
                        confirmButtonColor: '#663399'
                    });
            }
        }
    );
}

//TODO
async function previewContents(id) {
    if (document.getElementById(id).getAttribute("data-entry-type") == "dir") {

    } else if (document.getElementById(id).getAttribute("data-entry-type") == "file") {
        Swal.fire({
            title: id,
            html: "<div id='editor'></div>",
            showCloseButton: true,
            closeButtonAriaLabel: "Close Repository Details",
            showConfirmButton: false
        });
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        // editor.insert(window.entries[id].code)
    }
}

async function renameContents(id) {
    const {value: name} = await Swal.fire({
        title: 'Rename ' + id + '',
        text: 'Enter the new name below',
        input: 'text',
        inputPlaceholder: 'New Name',
        inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off'
        },
        showCancelButton: true,
        confirmButtonText: "Rename",
        cancelButtonText: "Cancel",
        confirmButtonColor: '#663399'
    })
    if (name) {
        // TODO Server Side Renaming
        Swal.fire({
            title: 'Renamed!',
            text: id + ' has been renamed to ' + name,
            type: 'success',
            confirmButtonColor: '#663399'
        });
    } else {
        Swal.fire({
            title: 'Rename Cancelled!',
            text: id + ' has not been renamed',
            type: 'error',
            confirmButtonColor: '#663399'
        });
    }
}

async function deleteContents(id) {
    Swal.fire({
        title: 'Confirm Deletion',
        html: 'Are you sure you want to delete <strong>' + id + '</strong>',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: '#663399'
    }).then((result) => {
        if (result.value) {
            // TODO Server side deletion
            Swal.fire(
                {
                    title: 'Deleted!',
                    text: id + ' has been deleted.',
                    type: 'success',
                    confirmButtonColor: '#663399'
                });
        } else {
            Swal.fire(
                {
                    title: 'Delete Cancelled!',
                    text: id + ' has not been deleted',
                    type: 'error',
                    confirmButtonColor: '#663399'
                });
        }
    });


}

async function copyContents(id) {

}

async function newFile() {
    const {value: fileName} = await Swal.fire({
        title: 'Create new File',
        input: 'text',
        showCancelButton: true,
        confirmButtonText: "Create",
        cancelButtonText: "Cancel",
        confirmButtonColor: '#663399',
        focusConfirm: false,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write something!'
            }
        }
    });
}

async function newFolder() {
    const {value: folderName} = await Swal.fire({
        title: 'Create new Folder',
        input: 'text',
        showCancelButton: true,
        confirmButtonText: "Create",
        cancelButtonText: "Cancel",
        confirmButtonColor: '#663399',
        focusConfirm: false,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write something!'
            }
        }
    });
}

async function uploadItem() {

}

async function newRepo() {
    const {value: formValues} = await Swal.fire({
        title: 'Create new Repo',
        html:
            '<input id="newRepoName" class="swal2-input">' +
            '<select id="newRepoAccount" class="swal2-input">\n' +
            '  <option value="github">Github</option>\n' +
            '  <option value="bitbucket">Bitbucket</option>\n' +
            '</select>\n' +
            "<div class='container-lock'>\n" +
            "  <span class='lock unlocked' id='lockspan' onclick='lock()'></span><div id='repostatus'>Public Repo</div>\n" +
            "</div>",
        showCancelButton: true,
        confirmButtonText: "Create",
        cancelButtonText: "Cancel",
        confirmButtonColor: '#663399',
        focusConfirm: false,
        preConfirm: () => {
            var is_private = !($('#lockspan').hasClass('unlocked'));
            return [
                document.getElementById('newRepoName').value,
                document.getElementById('newRepoAccount').value,
                is_private
            ]
        }
    });
    $.ajax({
        type: 'GET',
        url: '/castle/createRepo',
        dataType: "json",
        data: {
            'name': formValues[0],
            'host': formValues[1],
            'is_private': formValues[2],
        },
        success: function (data) {
            Swal.fire({
                title: 'Created!',
                text: formValues[0] + ' has been created',
                type: 'success',
                confirmButtonColor: '#663399'
            });
        }
    });
}

async function uploadRepo() {
    const {value: formValues} = await Swal.fire({
        title: 'Upload new Repo',
        html:
            '<input id="newRepoName" type="file" webkitdirectory mozdirectory class="swal2-input">' +
            '<select id="newRepoAccount" class="swal2-input">\n' +
            '  <option value="github">Github</option>\n' +
            '  <option value="bitbucket">Bitbucket</option>\n' +
            '</select>\n' +
            "<div class='container-lock'>\n" +
            "  <span class='lock unlocked' id='lockspan' onclick='lock()'></span><div id='repostatus'>Public Repo</div>\n" +
            "</div>",
        showCancelButton: true,
        confirmButtonText: "Create",
        cancelButtonText: "Cancel",
        confirmButtonColor: '#663399',
        focusConfirm: false,
        preConfirm: () => {
            return [
                document.getElementById('newRepoName').value,
                document.getElementById('newRepoAccount').value
            ]
        }
    });
}

async function pull() {
    // document.location.reload(false);
    Swal.fire(
        'Reload to Pull',
        "It's that easy!",
        'info'
    );
}

async function commit() {

}

async function push() {

}

async function newBranch(host, repoOwner, repoName) {
    const {value: branchName} = await Swal.fire({
        title: 'Branch off of ' + document.getElementById("dropdownMenuButton").innerText,
        input: 'text',
        showCancelButton: true,
        confirmButtonText: "Create",
        cancelButtonText: "Cancel",
        confirmButtonColor: '#663399',
        inputPlaceholder: 'New Branch Name',
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write something!'
            }
        }
    });
    $.ajax({
        type: 'GET',
        url: '/castle/newBranch',
        dataType: "json",
        data: {
            'name': branchName,
            'currentBranch': document.getElementById("dropdownMenuButton").innerText,
            'host': host,
            'owner': repoOwner,
            'repoName': repoName
        },
        success: function (data) {
            Swal.fire({
                title: 'Created!',
                text: branchName + ' has been created',
                type: 'success',
                confirmButtonColor: '#663399'
            });
        }
    });
}