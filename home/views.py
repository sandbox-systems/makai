# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render


def index(request):
    return render(request, 'home/index.html')


def team(request):
    return render(request, 'home/team.html')


def pricing(request):
    return render(request, 'home/pricing.html')


def home(request):
    return render(request, 'home/home.html')
