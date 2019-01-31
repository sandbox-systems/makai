from pybitbucket.bitbucket import *
from pybitbucket.auth import *

# print("sdxoivundxcoin")
# bitbucket = Client()

from git import *


class BitbucketHost(Host):
    def __init__(self, token_exists):
        # If token is not saved in session, let Host set up syncing link as instance variable
        Host.__init__(self, 'bitbucket_token',
                      None if token_exists else 'https://bitbucket.org/site/oauth2/authorize?response_type=code&client_id=' +
                                                bitbucket_config['client_id'], bitbucket_config['client_id'],
                      bitbucket_config['client_secret'])

    def fetch_token(self, code):
        return Host.fetch_token(self, code, "https://bitbucket.org/site/oauth2/access_token")
