# from github import Github
# from requests import post

# r = post("https://github.com/login/oauth/access_token",
#          data={'client_id': 'cfcb9d0319f6d921ae8d', 'client_secret': 'f011bb24a20ece7cb495df5cd057c3aeaa3f7de2',
#                'code': 'a21f17b767fbdc9cf8f0'})
#
# print(r.content)

# r = post("https://bitbucket.org/site/oauth2/access_token",
#          data={'client_id': 'QjQ49apJFL26jg8gzY', 'client_secret': '9QgdTN6pgZd9hNxStr6HeswgweZ2RpjT',
#                'code': 'M7z5dEEa8HysJqBGNH', 'grant_type': 'authorization_code'})
#
# print(r.content)
# NF47ou7cQAC054werBymImAZCaHA6kUgDFZRzy6ykJXw_aMUJpNFePdQGDSU2P9OiVztQe9OFj49tYWjIIU=

# # or using an access token
# g = Github("03e9927266b7d61aa86d823ed7fe2271d9d0975e")
#
# # Then play with your Github objects:
# for repo in g.get_user().get_repos():
#     print(repo.name)

from pybitbucket.bitbucket import *
from pybitbucket.auth import *

# print("sdxoivundxcoin")
# bitbucket = Client()

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
