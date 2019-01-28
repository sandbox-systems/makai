# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from firebase.credentials import config
from vcs.vcs import *


def login(request):
    return render(request, 'account/login.html', {'config': config})


def callback(request):
    request.session['uid'] = request.POST.get('uid')
    return redirect('home:Home')


def settings(request):
    return render(request, 'account/settings.html')


def sync(request):
    init_tokens(request)
    init_vcs()
    return render(request, 'account/sync.html', {'accounts': accounts.items()})
