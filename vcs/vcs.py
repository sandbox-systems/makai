from credentials import *
from github_vcs import *
from bitbucket_vcs import *
from firebase.firebase import get_doc
import re

tokens = dict()
accounts = dict()


def init_tokens(request, require_host=None):
    token_exists = False

    # Check to see if a token exists in the session for each available host and store each in tokens
    print request.session.items()
    for host in vcs_hosts:
        if require_host is not None and host != require_host:
            continue
        token = request.session.get('{}_token'.format(host))  # TODO use .get instead of [] to avoid throwing exception
        if token is not None:
            # Add token to appropriate host key
            tokens[host] = token
            token_exists = True
        else:
            # If at least one token isn't saved locally, check on FB once and set all tokens that aren't saved locally
            uid = request.session['uid']
            doc = get_doc('priv_user', uid).to_dict()

            # TODO if priv_user with this uid doesn't exist, create it?
            for key, value in doc.items():
                # key may be _token or _refresh_token; both should be added to session
                if key not in request.session and 'token' in key and value != '':
                    request.session[key] = value
                    # For just key = _token, add token to appropriate host
                    token_match = re.match(r'([a-z]+)_token', key)
                    if token_match:
                        _host = token_match.group(1)
                        tokens[_host] = value
                        token_exists = True

            # For hosts without a token saved anywhere, add sync link mapped to the host key
            if '{}_token'.format(host) not in request.session:
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
