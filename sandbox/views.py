# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from firebase.credentials import config


def sandbox(request):
    return render(request, 'sandbox/sandbox.html', {'config': config})
