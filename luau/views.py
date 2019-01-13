# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from firebase.credentials import config


def luau(request):
    return render(request, 'luau/luau.html', {'config': config})
