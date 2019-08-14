from credentials import *
from requests import post, get, put, delete, patch
from firebase.firebase import get_doc
from hashlib import sha1


# TODO remove concat_before; if want to concat before, just put to_concat as orig_path and vice versa
def path_concat(orig_path, to_concat, concat_before=False):
    if orig_path == '':
        return to_concat
    else:
        if concat_before:
            return to_concat + '/' + orig_path
        else:
            return orig_path + '/' + to_concat


class Host:
    def __init__(self, session_key, sync_link, client_id, client_secret):
        self.token = None
        # OAuth credentials
        self.client_id = client_id
        self.client_secret = client_secret
        # Name of token mapping key for this host in session
        self.session_key = session_key
        # If the token for this host is not saved in session, define a syncing link as not None
        self.sync_link = sync_link

    def authenticate(self, request):
        token = request.session.get(self.session_key)
        if token is not None:
            self.token = token
            return True
        return False

    # This just returns the response object
    def fetch_token(self, code, endpoint):
        r = post(endpoint, data={'client_id': self.client_id, 'client_secret': self.client_secret, 'code': code,
                                 'grant_type': 'authorization_code'})
        return r

    def refresh_token(self, refresh_token, endpoint):
        r = post(endpoint,
                 data={'client_id': self.client_id, 'client_secret': self.client_secret, 'refresh_token': refresh_token,
                       'grant_type': 'refresh_token'})
        return r

    def make_request(self, method, endpoint, auth_pattern, data=None, params=None, json=None):
        headers = {
            'Authorization': auth_pattern.format(self.token)
        }

        if method == 'get':
            r = get(endpoint, params=params, headers=headers, json=json)
        elif method == 'put':
            r = put(endpoint, data=data, headers=headers, json=json)
        elif method == 'post':
            r = post(endpoint, data=data, headers=headers, json=json)
        elif method == 'delete':
            r = delete(endpoint, data=data, headers=headers, json=json)
        elif method == 'patch':
            r = patch(endpoint, data=data, headers=headers, json=json)
        else:
            raise Exception('Invalid request method ' + method)
        return r

    def get_repos(self):
        return []

    def fetch_raw_repo(self, owner, name, branch, path):
        return None

    def get_repo(self, owner, name, branch, path):
        repo = self.fetch_raw_repo(owner, name, branch, path)
        repo_hash = sha1(owner).hexdigest() + sha1(name).hexdigest()

        # TODO modularize since this will be used for BB as well
        # TODO handle if change doc DNE
        changes = get_doc('file_changes', repo_hash).to_dict()

        if changes is None:
            return repo

        for raw_path, change in changes.items():
            # TODO modularize and ensure ; and : are safe to use
            full_path = raw_path.replace(';', '/').replace(':', '.')
            change_branch_parent = change[u'branch_parent'].split('_')
            change_branch = change_branch_parent[0]
            change_parent = change_branch_parent[1]

            if type(change) is not dict or change_branch != branch:
                continue

            if change_parent == path:
                # TODO bc this is in change_parent == path clause, if a folder in the current path only contains one
                # file which was deleted (or in general if the folder was deleted), that deletion will not be applied
                # and the folder will still show up. In general, if a user enters a folder inside of a repo that is
                # empty they should be presented with "<path> is empty in this repository or something", which would
                # take care of this anomaly
                if change[u'type'] == 'del':
                    del repo[full_path]
                elif change[u'type'] == 'add':
                    content = {
                        'type': 'file',
                        'name': change[u'name'],
                        'id': repo_hash + sha1(full_path).hexdigest(),
                        'repo_id': repo_hash
                    }
                    repo[change[u'name']] = content
            elif change_parent.startswith(path):
                # TODO delete folder if deeply enclosed file is deleted?
                if change[u'type'] == 'add':
                    # Should display new folder
                    change_breadcrumbs = change_parent.split('/')
                    breadcrumbs = path.split('/')

                    for node in breadcrumbs:
                        if node in change_breadcrumbs:
                            change_breadcrumbs.remove(node)

                    dir_name = change_breadcrumbs[0]
                    content = {
                        'type': 'dir',
                        'name': dir_name,
                        'id': repo_hash + sha1(full_path).hexdigest(), # TODO should change?
                        'repo_id': repo_hash
                    }
                    repo[dir_name] = content

        return repo

    def create_repo(self, name, is_private):
        pass

    def delete_repo(self, name, owner):
        pass

    def rename_repo(self, name, owner, newName):
        pass

    def edit_repo_des(self, name, owner, newDes):
        pass

    def create_branch(self, name, currentBranch, owner, repoName):
        pass