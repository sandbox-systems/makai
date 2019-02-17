from github import Github

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
        return response['access_token'][0]

    def get_repos(self):
        g = Github(self.token)
        for repo in g.get_user().get_repos():
            print(repo.name)

# # or using an access token
# g = Github("03e9927266b7d61aa86d823ed7fe2271d9d0975e")
#
# # Then play with your Github objects:
# for repo in g.get_user().get_repos():
#     print(repo.name)
