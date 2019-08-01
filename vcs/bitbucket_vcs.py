from git import *
from hashlib import sha1


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
                                     params={'role': 'member', 'pagelen': '30'}).json()
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
                'is_private': raw_repo[u'is_private']
            }
            repos[raw_repo[u'full_name']] = repo
        return repos

    def get_repo(self, owner, name, branch, path):
        repo_hash = sha1(owner).hexdigest() + sha1(name).hexdigest()
        response = self.make_request('get', 'https://api.github.com/repos/' + owner + '/' + name + '/contents/' + path,
                                     params={'ref': branch}).json()
        contents = dict()
        for raw_content in response:
            _path = path_concat(path, raw_content[u'name'])
            full_path = path_concat(_path, branch, concat_before=True)
            content_id = repo_hash + sha1(full_path).hexdigest()
            content = {
                'type': raw_content[u'type'],
                'name': raw_content[u'name'],
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
        return contents
