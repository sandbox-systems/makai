# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from firebase.credentials import config
from vcs.vcs import *


def login(request):
    return render(request, 'account/login.html', {'config': config})


def login_callback(request):
    request.session['uid'] = request.POST.get('uid')
    return redirect('home:Home')


def settings(request):
    return render(request, 'account/settings.html')


def sync(request):
    init_tokens(request)
    init_vcs()
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

            print(accounts[host].fetch_token(code))
            return render(request, 'account/syncCallback.html')
    # If there was an error anywhere in the process
    return render(request, 'account/syncCallbackErrored.html')

