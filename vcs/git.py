from credentials import *


class Host:
    def __init__(self, session_key, sync_link):
        self.token = None
        self.session_key = session_key
        # If the token for this host is not saved in session, define a syncing link as not None
        self.sync_link = sync_link

    def authenticate(self, request):
        token = request.session.get(self.session_key)
        if token is not None:
            self.token = token
            return True
        return False
