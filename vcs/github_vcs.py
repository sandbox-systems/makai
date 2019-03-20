from github import Github

from git import *
from urlparse import parse_qs
from hashlib import sha1
from firebase.firebase import get_doc

class GithubHost(Host):
    def __init__(self, token_exists):
        # If token is not saved in session, let Host set up syncing link as instance variable
        Host.__init__(self, 'github_token',
                      None if token_exists else 'https://github.com/login/oauth/authorize?scope=repo delete_repo&client_id=' +
                                                github_config['client_id'], github_config['client_id'],
                      github_config['client_secret'])

    def fetch_token(self, code):
        # POST response content must be parsed as query string
        response = parse_qs(Host.fetch_token(self, code, "https://github.com/login/oauth/access_token").content)
        if 'error_description' in response:
            return False
        # When parsed, the access_token is mapped to an array only containing the token for some reason
        return response['access_token'][0], None

    def get_repos(self):
        response = self.make_request('get', 'https://api.github.com/user/repos', params={}).json()
        # TODO Pagination
        repos = dict()
        for raw_repo in response:
            repo = {
                'host': 'github',
                'name': raw_repo[u'name'],
                'description': raw_repo[u'description'],
                'updated_on': raw_repo[u'updated_at'],
                'is_private': raw_repo[u'private']
            }
            repos[raw_repo[u'full_name']] = repo
        return repos
        # g = Github(self.token)
        # for repo in g.get_user().get_repos():
        #     print(g.get_repo(repo.full_name))

    def get_repo(self, owner, name, branch, path):
        repo_hash = sha1(owner).hexdigest() + sha1(name).hexdigest()
        response = self.make_request('get', 'https://api.github.com/repos/' + owner + '/' + name + '/contents/' + path,
                                     params={'ref': branch}).json()
        contents = dict()
        for raw_content in response:
            _path = path_concat(path, raw_content[u'name'])
            full_path = path_concat(_path, branch, concat_before=True)
            content = {
                'type': raw_content[u'type'],
                'name': raw_content[u'name']
            }
            contents[full_path] = content

        changes = get_doc('file_changes', repo_hash).to_dict()
        for full_path, change in changes.items():
            if change[u'branch_parent'] == branch + '_' + path:
                if change[u'type'] == 'del':
                    del contents[full_path]
                elif change[u'type'] == 'add':
                    contents[full_path] = {
                        'type': 'file',
                        'name': change[u'name']
                    }
        return contents
