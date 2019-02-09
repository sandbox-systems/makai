# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from vcs.vcs import *


def projects(request):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)
    accounts['github'].get_repos()
    print("BREAK")
    accounts['bitbucket'].get_repos()
    return render(request, 'castle/projects.html')
