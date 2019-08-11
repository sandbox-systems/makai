from git import *
from urlparse import parse_qs


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
            languageResponse = self.make_request('get',
                                                 raw_repo[u'languages_url']).json()
            # print languageResponse
            repo = {
                'host': 'github',
                'name': raw_repo[u'name'],
                'description': raw_repo[u'description'],
                'updated_on': raw_repo[u'updated_at'],
                'is_private': raw_repo[u'private'],
                'size': raw_repo[u'size'],
                # 'language': languageResponse.keys()[0],
                'owner': raw_repo[u'full_name'].split('/')[0]
            }
            repos[raw_repo[u'full_name']] = repo
        return repos
        # g = Github(self.token)
        # for repo in g.get_user().get_repos():
        #     print(g.get_repo(repo.full_name))

    def fetch_raw_repo(self, owner, name, branch, path):
        # repo_hash = sha1(owner).hexdigest() + sha1(name).hexdigest()
        response = self.make_request('get', 'https://api.github.com/repos/' + owner + '/' + name + '/contents/' + path,
                                     params={'ref': branch}).json()
        contents = dict()
        # print response
        for raw_content in response:
            # _path = path_concat(path, raw_content[u'name'])
            # full_path = path_concat(_path, branch, concat_before=True)
            content = {
                'type': raw_content[u'type'],
                'name': raw_content[u'name'],
                'filepath': raw_content[u'path']
            }
            contents[raw_content[u'name']] = content
        return contents

    def get_branches(self, owner, name):
        response = self.make_request('get', 'https://api.github.com/repos/' + owner + '/' + name + '/branches').json()
        branches = []
        for raw_content in response:
            branches.append(raw_content[u'name'])
        return branches
    # def create_repo(self, ):

# # or using an access token
# g = Github("03e9927266b7d61aa86d823ed7fe2271d9d0975e")
#
# # Then play with your Github objects:
# for repo in g.get_user().get_repos():
#     print(repo.name)
