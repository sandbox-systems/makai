from git import *
from pybitbucket.bitbucket import *
from pybitbucket.auth import *


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
                'language': raw_repo[u'language'],
                'owner': raw_repo[u'full_name'].split('/')[0]

            }
            repos[raw_repo[u'full_name']] = repo
        return repos

    def get_repo(self, owner, name, branch, path):
        requestBuild = 'https://api.bitbucket.org/2.0/repositories/' + owner + "/" + name + "/src/" + path
        temp = requestBuild.index('src/') + 4
        contents = dict()
        while requestBuild != "":
            response = self.make_request('get',
                                         requestBuild,
                                         params={'role': 'member', 'pagelen': '100'}).json()
            for raw_content in response[u'values']:
                self.refresh(response)
                content = {
                    'type': raw_content[u'type'],
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
