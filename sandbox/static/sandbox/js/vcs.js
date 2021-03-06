function getAllRepos() {
    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            url: "/castle/",
            data: {},
            beforeSend: function (xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success: function (data, status, xhttp) {
                let repos = [];

                Object.values(data).forEach(repoDatum => {
                    let repo = new Repository(repoDatum.name, repoDatum.owner, repoDatum.host, repoDatum.repo_hash);
                    repos.push(repo);
                });

                resolve(repos);
            }, error: function (data) {
                // TODO handle error
                console.log(data);
            },
            dataType: "json"
        });
    });
}

let Firebase = {
    firebasePathEncode: function (path) {
        /**
         * Encode path to format that paths are stored in firebase keys (/ -> ; and . -> : TODO change as necessary--ensure
         * they don't can't show up in the path otherwise)
         */
        let encoded = path.replace(/\//g, ';');
        encoded = encoded.replace(/\./g, ':');
        return encoded;
    },
    firebasePathDecode: function (path) {
        /**
         * Decode path from firebase storage format
         */
        let decoded = path.replace(/;/g, '/');
        decoded = decoded.replace(/:/g, '.');
        return decoded;
    },
    decodeKeys: function (doc) {
        /**
         * Given raw document fetched from firebase with encoded keys, decode all keys and return decoded document
         */
        let decoded = {};
        Object.keys(doc).forEach(key => {
            decoded[this.firebasePathDecode(key)] = doc[key];
        });
        return decoded;
    },
    fetchFileChanges: function (repo_id) {
        /**
         * Fetch decoded file changes doc associated with repo_id
         */
        return new Promise(resolve => {
            firestore.collection('file_changes').doc(repo_id).get()
                .then(doc => {
                    let decodedDoc = this.decodeKeys(doc.data());
                    resolve(decodedDoc);
                })
                .catch(err => {
                    // TODO Handle error "Uh oh! We had some trouble retrieving your changes to this repository. Please try again"
                });
        });
    },
    clearChanges: function (repo_id, branch, existChangesFromOtherBranch) {
        return new Promise(resolve => {
            if (existChangesFromOtherBranch === undefined) {
                // TODO check if changes from other branch exist in document for repo_id and define
                // existChangesFromOtherBranch
            }

            if (existChangesFromOtherBranch) {
                // TODO find and delete only changes from given branch
            } else {
                // Delete entire document as it is now empty
                firestore.collection("file_changes").doc(repo_id).delete()
                    .then(function () {
                        console.log("Deleted changes document for branch {0}".format(branch));
                        resolve();
                    }).catch(function (error) {
                        // TODO Handle error-move clearChanges invocation before commit push so if unsuccessful in
                        // deleting, user asked to retry before commit made?
                        console.error("Error removing document: ", error);
                    });
            }
        });
    }
};

function Github(accessToken) {
    // Instantiate the axios request builder with github API and access token
    this.reqBuilder = axios.create({
        baseURL: 'https://api.github.com/',
        headers: {
            "Authorization": "token {0}".format(accessToken)
        }
    });

    /**
     * Fetch ref sha associated with branch
     *
     * @return sha
     *
     * **May throw exception upon error**
     */
    this.fetchRef = async function (owner, repo, branch) {
        return new Promise(resolve => {
            this.reqBuilder.get('/repos/{0}/{1}/git/refs/heads/{2}'.format(owner, repo, branch))
                .then(function (response) {
                    resolve(response.data.object.sha);
                })
                .catch(function (error) {
                    throw("Error fetching branch ref sha: {0}".format(error));
                });
        });
    };

    /**
     * Point a branch HEAD to a new tree
     *
     * @param newRef        Ref sha of new tree
     * @return void
     *
     * **May throw exception upon error**
     */
    this.updateRef = async function (owner, repo, branch, newRef) {
        return new Promise(resolve => {
            this.reqBuilder.patch('/repos/{0}/{1}/git/refs/heads/{2}'.format(owner, repo, branch),
                {
                    "sha": newRef,
                    "force": true // TODO change according to wanting to fast-forward commit, for making VCS
                })
                .then(function () {
                    resolve();
                })
                .catch(function (error) {
                    throw("Error changing HEAD pointer: {0}".format(error));
                })
        });
    };

    /**
     * Fetch raw tree data for given tree sha
     *
     * @return array of nodes, including blobs and subtrees
     *
     * **May throw exception upon error**
     */
    this.fetchTree = async function (owner, repo, treeSha) {
        return new Promise(resolve => {
            this.reqBuilder.get('/repos/{0}/{1}/git/trees/{2}'.format(owner, repo, treeSha))
                .then(function (response) {
                    resolve(response.data.tree);
                })
                .catch(function (error) {
                    throw("Error fetching tree: {0}".format(error));
                });
        });
    };

    /**
     * Recursively iterate through tree associated with branch and add each blob node to output tree object
     *
     * @param treeSha       Ref sha of tree to iterate through in this level
     * @param tree          Output tree object to add blob nodes to
     * @param breadcrumbs   Built up path from higher level calls. For example, a project contains a folder A in root.
     *                      Root iteration, with breadcrumbs "", finds folder and recursively enters, passing "A/" for
     *                      breadcrumbs.
     * @return void
     */
    this.fillOldTree = async function (owner, repo, branch, treeSha, tree, breadcrumbs) {
        let treeAtCurrentPoint = await this.fetchTree(owner, repo, treeSha);

        // TODO make it so only trees that contain changes are fetched
        treeAtCurrentPoint.forEach(async node => {
            if (node.type === "tree") {
                // Recursively enter subtree
                let newBreadcrumbs = breadcrumbs + node.path + '/';
                await this.fillOldTree(owner, repo, branch, node.sha, tree, newBreadcrumbs);
            } else {
                // Found a blob to add to output tree
                node.path = breadcrumbs + node.path;
                // Match key with that in firebase to make indexing easier
                tree[branch + '/' + node.path] = node;
            }
        });
    };

    /**
     * Generate full tree for branch
     *
     * @param refSha        Root ref sha for branch
     * @return object mapping full file path to each node in recursive tree associated with branch
     */
    this.getFullTreeAtRef = async function (owner, repo, branch, refSha) {
        let tree = {};
        await this.fillOldTree(owner, repo, branch, refSha, tree, "");
        return tree;
    };

    /**
     * Fetch sha for a blob of contents
     *
     * @return sha
     *
     * **May throw exception upon error**
     */
    this.getBlobSha = async function (owner, repo, content) {
        return new Promise(resolve => {
            this.reqBuilder.post('/repos/{0}/{1}/git/blobs'.format(owner, repo),
                {
                    "content": content,
                    "encoding": "utf-8"
                })
                .then(function (response) {
                    resolve(response.data.sha);
                })
                .catch(function (error) {
                    throw("Error fetching sha of blob: {0}".format(error));
                });
        });
    };

    /**
     * Fetch encoded contents of a file at a path
     *
     * @return string of file contents
     */
    this.getFileContents = async function (owner, repo, path) {
        return new Promise(resolve => {
            this.reqBuilder.get('/repos/{0}/{1}/contents/{2}'.format(owner, repo, path))
                .then(function (response) {
                    resolve(atob(response.data.content));
                })
                .catch(function (error) {
                    throw("Error fetching contents of file at path {0}: {1}".format(path, error));
                });
        });
    };

    /**
     * Fetch sha associated with a tree object
     *
     * @param tree          Array of nodes constituting the tree's deep hierarchy
     * @return sha
     *
     * **May throw exception upon error**
     */
    this.postTree = async function (owner, repo, tree) {
        return new Promise(resolve => {
            this.reqBuilder.post('/repos/{0}/{1}/git/trees'.format(owner, repo),
                {
                    "tree": tree
                })
                .then(function (response) {
                    resolve(response.data.sha);
                })
                .catch(function (error) {
                    throw("Error generating new tree: {0}".format(error));
                });
        });
    };

    /**
     * Fetch sha associated with generating a new commit for a given tree ref sha
     *
     * @param tree          Ref sha of tree to create commit from
     * @param baseRef       Parent commit ref sha
     * @return sha
     *
     * **May throw exception upon error**
     */
    this.generateCommit = async function (owner, repo, message, tree, baseRef) {
        return new Promise(resolve => {
            this.reqBuilder.post('/repos/{0}/{1}/git/commits'.format(owner, repo),
                {
                    "message": message,
                    "parents": [baseRef], // API requires an array of parents instead of just a string of one
                    "tree": tree
                })
                .then(function (response) {
                    resolve(response.data.sha);
                })
                .catch(function (error) {
                    throw("Error generating new commit: {0}".format(error));
                });
        });
    };

    /**
     * Apply file changes to appropriate branch and commit and push changes to remote
     */
    this.commit = async function (owner, repo, repo_id, branch, message) {
        try {
            let changes = await Firebase.fetchFileChanges(repo_id);
            let baseRef = await this.fetchRef(owner, repo, branch);
            let tree = await this.getFullTreeAtRef(owner, repo, branch, baseRef);

            for (let i = 0; i < Object.keys(changes).length; i++) {
                let fullPath = Object.keys(changes)[i];
                let change = changes[fullPath];

                // Ignore changes that aren't applied to this branch
                if (!change.branch_path.startsWith(branch)) {
                    continue;
                }

                let filePath = fullPath.replace("{0}/".format(branch), ""); // fullPath contains <branch>/

                switch (change.type) {
                    case 'add':
                    case 'upd':
                        // TODO determine if sha for blank file is constant; if so, no need for request
                        let sha = await this.getBlobSha(owner, repo, change.type === "add" ? "" : change.content);
                        let node = {
                            mode: "100644", // TODO account for executables (mode 100755) or subtrees (mode 040000)
                            path: filePath,
                            sha: sha,
                            type: "blob"
                        };
                        tree[fullPath] = node;
                        break;
                    case 'del':
                        delete tree[fullPath];
                        break;
                }
            }

            let newTree = await this.postTree(owner, repo, Object.values(tree));
            let newRef = await this.generateCommit(owner, repo, message, newTree, baseRef);
            await this.updateRef(owner, repo, branch, newRef);
        } catch (err) {
            console.log("Error committing: {0}".format(err));
            // TODO Handle error "Uh oh! We had some trouble committing your changes. Please try again"
        }
    }
}

function Bitbucket(accessToken) {
    // Instantiate the axios request builder with bitbucket API and access token
    this.reqBuilder = axios.create({
        baseURL: ' https://api.bitbucket.org/2.0/',
        headers: {
            "Authorization": "Bearer {0}".format(accessToken)
        }
    });

    this.commit = async function (owner, repo, repo_id, branch, message) {
        try {
            let changes = await Firebase.fetchFileChanges(repo_id);
            let existChangesFromOtherBranch = false;
            let formData = new FormData();

            for (let i = 0; i < Object.keys(changes).length; i++) {
                let fullPath = Object.keys(changes)[i];
                let change = changes[fullPath];

                // Ignore changes that aren't applied to this branch but note that they exist to determine whether to
                // delete document after applying all changes
                if (!change.branch_parent.startsWith(branch)) {
                    existChangesFromOtherBranch = true;
                    continue;
                }

                let filePath = fullPath.replace("{0}/".format(branch), ""); // fullPath contains <branch>/

                switch (change.type) {
                    case 'add':
                    case 'upd':
                        formData.append(filePath, change.type === "add" ? "" : change.content);
                        break;
                    case 'del':
                        formData.append('files', filePath);
                        break;
                }
            }

            this.reqBuilder.post('repositories/{0}/{1}/src'.format(owner, repo), formData, {params: {
                    branch: branch,
                    message: message
                }})
                .then(function (response) {
                    console.log(response)
                })
                .catch(function (error) {
                    console.log(error);
                });

            await Firebase.clearChanges(repo_id, branch, existChangesFromOtherBranch);
        } catch (err) {
            console.log("Error committing: {0}".format(err));
            // TODO Handle error "Uh oh! We had some trouble committing your changes. Please try again"
        }
    }
}

function Repository(name, owner, hostName, repoID) {
    this.name = name;
    this.owner = owner;
    this.hostName = hostName;
    this.repoID = repoID;
    this.branch = "master";

    this.setHost = function (host) {
        this.host = host;
    }
}
