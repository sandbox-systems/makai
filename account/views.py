# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect

from firebase.web_credentials import config
from vcs.vcs import *
from firebase.firebase import update_doc, get_doc, create_empty_doc


def login(request, was_attempt_redirected=None):
    return render(request, 'account/login.html', {'config': config, 'was_attempt_redirected': was_attempt_redirected})


def login_callback(request):
    uid = request.POST.get('uid')
    request.session['uid'] = uid

    # Create priv_user document for user if does not exist already
    priv_user_doc = get_doc('priv_user', uid).to_dict()
    if not priv_user_doc:
        create_empty_doc('priv_user', uid)

    return redirect('home:Home')


def logout(request):
    request.session.flush()
    return render(request, 'account/logout.html', {'config': config})


def settings(request):
    return render(request, 'account/settings.html')


def sync(request):
    init_tokens(request)
    init_vcs()
    # print(request.session['bitbucket_token'])
    # request.session.flush()

    return render(request, 'account/sync.html', {'accounts': accounts.items()})


def sync_callback(request, host):
    # host should be passed in by callback urls defined in OAuth app settings
    # Ensure host is valid, request is GET, and contains code
    if host in vcs_hosts and request.method == 'GET' and 'code' in request.GET:
        code = request.GET['code']

        # Ensure code has a value
        if code:
            init_tokens(request)
            init_vcs()

            # TODO Handle False return
            token, refresh_token = accounts[host].fetch_token(code)

            # Ensure there was no error fetching the token from the code (fetch_token should return False it there was)
            if token is not False:
                request.session[host + '_token'] = token

                # Create an updated mapping of host_token to the fetched token
                doc_update = dict()
                if token:
                    doc_update[(host + '_token').decode('utf-8')] = token.decode('utf-8')
                if refresh_token:
                    doc_update[(host + '_refresh_token').decode('utf-8')] = refresh_token.decode('utf-8')

                # Update the firebase document reference with the new token
                update_doc('priv_user', request.session.get('uid'), doc_update)

                # TODO Handle error updating doc?
                return render(request, 'account/syncCallback.html')
    # If there was an error anywhere in the process
    return render(request, 'account/syncCallbackErrored.html')


def update_tokens(request, host):
    token = request.GET.get('token')
    refresh_token = request.GET.get('refresh_token')

    request.session[host + '_token'] = token
    request.session[host + '_refresh_token'] = refresh_token

    # Create an updated mapping of host_token to the fetched token
    doc_update = dict()
    if token:
        doc_update[(host + '_token').decode('utf-8')] = token.decode('utf-8')
    if refresh_token:
        doc_update[(host + '_refresh_token').decode('utf-8')] = refresh_token.decode('utf-8')

    # Update the firebase document reference with the new token
    update_doc('priv_user', request.session.get('uid'), doc_update)
