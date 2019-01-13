# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from firebase.credentials import config


def login(request):
    return render(request, 'account/login.html', {'config': config})


def callback(request):
    request.session['uid'] = request.POST.get('uid')
    return redirect('home:Home')


def settings(request):
    return render(request, 'account/settings.html')
