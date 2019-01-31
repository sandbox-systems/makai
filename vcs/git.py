from credentials import *
from requests import post


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

    def fetch_token(self, code, endpoint):
        r = post(endpoint, data={'client_id': self.client_id, 'client_secret': self.client_secret, 'code': code,
                                 'grant_type': 'authorization_code'})
        return r.content
