from credentials import *
from github_vcs import *
from bitbucket_vcs import *

tokens = dict()
accounts = dict()


def init_tokens(request):
    token_exists = False

    # Check to see if a token exists in the session for each available host and store each in tokens
    for host in vcs_hosts:
        token = request.session.get(host + '_token')
        if token is not None:
            # Add token to appropriate host key
            tokens[host] = token
            token_exists = True
        else:
            # For hosts without a token saved, add sync link mapped to the host key
            tokens[host] = False

    return token_exists


def init_vcs(exclude_unsynced=False):
    for host, token in tokens.items():
        if not exclude_unsynced or token is not False:
            if host == 'github':
                accounts[host] = GithubHost(token is not False)
            elif host == 'bitbucket':
                accounts[host] = BitbucketHost(token is not False)


def auth_vcs(request):
    for host, account in accounts.iteritems():
        if isinstance(account, Host):
            account.authenticate(request)


def merge_dicts(a, b):
    c = a.copy()
    c.update(b)
    return c
