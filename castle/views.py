# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from vcs.vcs import *


def projects(request):
    print(request.session.get('uid'))
    if not init_tokens(request):
        return redirect('account:Sync')
    return render(request, 'castle/projects.html')
