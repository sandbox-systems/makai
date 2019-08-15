from git import *
from hashlib import sha1
from requests import get


# TODO use str.format instead of concatenating strings
class BitbucketHost(Host):
    @staticmethod
    def normalize_type(raw_type):
        if raw_type == 'commit_file':
            return 'file'
        elif raw_type == 'commit_direcotry':
            return 'directory'
        else:
            print("Error: Invalid raw type, couldn't normalize")
            return ''

    def __init__(self, token_exists):
        # If token is not saved in session, let Host set up syncing link as instance variable
        Host.__init__(self, 'bitbucket_token', 'bitbucket_refresh_token',
                      None if token_exists else 'https://bitbucket.org/site/oauth2/authorize?response_type=code&client_id=' +
                                                bitbucket_config['client_id'], bitbucket_config['client_id'],
                      bitbucket_config['client_secret'])

    def fetch_token(self, code):
        # POST response can be parsed as JSON directly
        response = Host.fetch_token(self, code, "https://bitbucket.org/site/oauth2/access_token").json()
        if 'error_description' in response:
            return False
        return response['access_token'], response['refresh_token']

    def refresh(self, response):
        # TODO use .get instead of [] more for any dictionary access? Avoids potential error
        if response.get(u'type') == u'error':
            if 'refresh' in response[u'error'][u'message']:
                # TODO ensure has refresh token
                response = Host.fetch_refreshed_token(self, self.refresh_token,
                                                      'https://bitbucket.org/site/oauth2/access_token').json()
                if 'error_description' in response or 'access_token' not in response:
                    return False

                token = response['access_token']
                refresh_token = response.get('refresh_token')

                get('{}/{}?token={}&refresh_token={}'.format(
                    reversed('account:UpdateTokens'), 'bitbucket', token, refresh_token))
            else:
                # TODO handle unexpected error, take back to sync page?
                return False
        return True

    def make_request(self, method, endpoint, auth_pattern='Bearer {}', data=None, params=None, json=None):
        return Host.make_request(self, method, endpoint, auth_pattern, data=data, params=params, json=json)

    def get_repos(self):
        request_build = 'https://api.bitbucket.org/2.0/repositories'
        response = self.make_request('get', request_build,
                                     params={'role': 'member', 'pagelen': '100'}).json()

        repos = dict()

        if not self.refresh(response):
            return repos

        while request_build != "":
            for raw_repo in response[u'values']:
                owner = raw_repo[u'full_name'].split('/')[0]
                name = raw_repo[u'name']
                repo_hash = sha1(owner).hexdigest() + sha1(name).hexdigest()
                repo = {
                    'host': 'bitbucket',
                    'name': name,
                    'description': raw_repo[u'description'],
                    'updated_on': raw_repo[u'updated_on'],
                    'is_private': raw_repo[u'is_private'],
                    'size': raw_repo[u'size'],
                    # 'language': raw_repo[u'language'],
                    'owner': owner,
                    'repo_hash': repo_hash
                }
                repos[raw_repo[u'full_name']] = repo
            if 'next' in response.keys():
                request_build = response[u'next']
            else:
                request_build = ""
        return repos

    def get_repo_at_path(self, owner, name, branch, path):
        repo_hash = sha1(owner).hexdigest() + sha1(name).hexdigest()
        response = self.make_request(
            'get',
            'https://api.bitbucket.org/2.0/repositories/{}/{}/src/{}/{}'.format(owner, name, branch, path),
            params={'ref': branch}
        ).json()
        contents = dict()
        directories = list()

        self.refresh(response)

        # TODO handle error if repo not found at path
        for raw_content in response[u'values']:
            if raw_content[u'type'] == 'commit_directory':
                directories.append(raw_content[u'path'])
            else:
                _path = raw_content[u'path']
                full_path = path_concat(_path, branch, concat_before=True)
                content_id = repo_hash + sha1(full_path).hexdigest()
                name = raw_content[u'path'].split('/')[-1]
                content = {
                    'type': self.normalize_type(raw_content[u'type']),
                    'name': name,
                    'id': content_id,
                    'repo_id': repo_hash,
                    # File contents
                }
                contents[full_path] = content

        # TODO modularize since this will be used for BB as well
        # TODO handle if change doc DNE
        # changes = get_doc('file_changes', repo_hash).to_dict()
        # for raw_path, change in changes.items():
        #     # TODO modularize and ensure ; and : are safe to use
        #     full_path = raw_path.replace(';', '/')
        #     full_path = full_path.replace(':', '.')
        #     if type(change) is dict and change[u'branch_parent'] == branch + '_' + path:
        #         if change[u'type'] == 'del':
        #             del contents[full_path]
        #         elif change[u'type'] == 'add':
        #             content = {
        #                 'type': 'file',
        #                 'name': change[u'name'],
        #                 'id': repo_hash + sha1(full_path).hexdigest(),
        #                 'repo_id': repo_hash
        #             }
        #             contents[full_path] = content
        return contents, directories

    def fill_full_repo(self, owner, name, branch, path, out_content):
        files, directories = self.get_repo_at_path(owner, name, branch, path)
        out_content.update(files)

        for directory in directories:
            self.fill_full_repo(owner, name, branch, directory, out_content)

    def get_full_repo(self, owner, name, branch):
        contents = dict()
        self.fill_full_repo(owner, name, branch, '', contents)
        return contents

    def fetch_raw_repo(self, owner, name, branch, path):
        requestBuild = 'https://api.bitbucket.org/2.0/repositories/' + owner + "/" + name + "/src/" + path
        temp = requestBuild.index('src/') + 4
        contents = dict()
        while requestBuild != "":
            response = self.make_request('get',
                                         requestBuild,
                                         params={'role': 'member', 'pagelen': '100'}).json()
            for raw_content in response[u'values']:
                self.refresh(response)
                type = 'file' if raw_content[u'type'] == 'commit_file' else 'dir'
                content = {
                    'type': type,
                    'name': raw_content[u'path'].split("/")[-1],
                    'filepath': raw_content[u'path'],
                    'requestLink': raw_content[u'links'][u'self'][u'href'][temp:]
                }
                contents[raw_content[u'path'].split("/")[-1]] = content
            if 'next' in response.keys():
                requestBuild = response[u'next']
            else:
                requestBuild = ""
        return contents

    def get_branches(self, owner, name):
        response = self.make_request('get',
                                     'https://api.bitbucket.org/2.0/repositories/' + owner + '/' + name + '/refs/branches',
                                     params={'role': 'member', 'pagelen': '100'}).json()
        branches = []
        for raw_content in response[u'values']:
            branches.append(raw_content[u'name'])
        return branches

    # Owner is not defined
    def create_repo(self, name, is_private):
        response = self.make_request('post',
                                     'https://api.bitbucket.org/2.0/repositories/' + owner + '/' + name,
                                     data={"is_private": is_private, 'role': 'member', 'pagelen': '100'}).json()
        return

    def delete_repo(self, name, owner):
        response = self.make_request('delete',
                                     'https://api.bitbucket.org/2.0/repositories/' + owner + '/' + name,
                                     data={'role': 'member'}).json()
        return

    def rename_repo(self, name, owner, newName):
        response = self.make_request('put',
                                     'https://api.bitbucket.org/2.0/repositories/' + owner + '/' + name,
                                     data={'role': 'member', "name": newName}).json()
        return

    def edit_repo_des(self, name, owner, newDes):
        response = self.make_request('put',
                                     'https://api.bitbucket.org/2.0/repositories/' + owner + '/' + name,
                                     data={'role': 'member', "description": newDes}).json()
        return

    # TODO Implement
    def create_branch(self, name, currentBranch, owner, repoName):
        response = self.make_request('post',
                                     'https://api.bitbucket.org/2.0/repositories/' + owner + '/' + repoName + '/refs/branches',
                                     data={'name': '', 'target.hash': ''}).json()
        return
