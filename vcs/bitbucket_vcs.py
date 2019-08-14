from git import *


class BitbucketHost(Host):
    def __init__(self, token_exists):
        # If token is not saved in session, let Host set up syncing link as instance variable
        Host.__init__(self, 'bitbucket_token',
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
        pass
        # if response[u'type'] == u'error' and 'refresh' in response[u'error'][u'message']:
        #     self.refresh_token('', 'https://bitbucket.org/site/oauth2/access_token')

    def make_request(self, method, endpoint, auth_pattern='Bearer {}', data=None, params=None):
        return Host.make_request(self, method, endpoint, auth_pattern, data=data, params=params)

    def get_repos(self):
        response = self.make_request('get', 'https://api.bitbucket.org/2.0/repositories',
                                     params={'role': 'member', 'pagelen': '100'}).json()
        # TODO Pagination
        self.refresh(response)
        # print(response)
        repos = dict()
        for raw_repo in response[u'values']:
            repo = {
                'host': 'bitbucket',
                'name': raw_repo[u'name'],
                'description': raw_repo[u'description'],
                'updated_on': raw_repo[u'updated_on'],
                'is_private': raw_repo[u'is_private'],
                'size': raw_repo[u'size'],
                # 'language': raw_repo[u'language'],
                'owner': raw_repo[u'full_name'].split('/')[0]
            }
            repos[raw_repo[u'full_name']] = repo
        print repos
        return repos

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

    def create_repo(self, name, is_private):
        response = self.make_request('post',
                                     'https://api.bitbucket.org/2.0/repositories/' + owner + '/' + name,
                                     data={"is_private": is_private, 'role': 'member', 'pagelen': '100'}).json()
        return

    def delete_repo(self, name, owner):
        response = self.make_request('delete',
                                     'https://api.bitbucket.org/2.0/repositories/' + owner + '/' + name).json()
        return

    def rename_repo(self, name, owner, newName):
        response = self.make_request('put',
                                     'https://api.bitbucket.org/2.0/repositories/' + owner + '/' + name,
                                     data={"name": newName}).json()
        return

    def edit_repo_des(self, name, owner, newDes):
        response = self.make_request('put',
                                     'https://api.bitbucket.org/2.0/repositories/' + owner + '/' + name,
                                     data={"description": newDes}).json()
        return

    def create_branch(self, name, currentBranch, owner, repoName):
        response = self.make_request('post',
                                     'https://api.bitbucket.org/2.0/repositories/' + owner + '/' + repoName + '/refs/branches',
                                     data={'name': '', 'target.hash': ''}).json()
        return
