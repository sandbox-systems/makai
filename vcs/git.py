from credentials import *
from requests import post, get, put


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

    def make_request(self, method, endpoint, data=None, params=None):
        if data is not None:
            data['access_token'] = self.token
        if params is not None:
            params['access_token'] = self.token

        if method == 'get':
            r = get(endpoint, params=params)
        elif method == 'put':
            r = put(endpoint, data=data)
        elif method == 'post':
            r = post(endpoint, data=data)
        else:
            raise Exception('Invalid request method ' + method)
        return r

    def get_repos(self):
        return []

    def get_repo(self, owner, name, branch, path):
        return None
