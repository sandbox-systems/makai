# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render


def login(request):
    return render(request, 'account/login.html')


def settings(request):
    return render(request, 'account/settings.html')
