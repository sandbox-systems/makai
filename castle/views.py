# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render


def projects(request):
    return render(request, 'castle/projects.html')
