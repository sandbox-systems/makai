# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from vcs.vcs import *


def projects(request):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)
    repos = merge_dicts(accounts['github'].get_repos(), accounts['bitbucket'].get_repos())
    return render(request, 'castle/projects.html', {'repos': repos})


def project(request, host, owner, repo, branch, path):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)
    print(host)
    print(owner)
    print(repo)
    print(branch)
    print(path)
    return render(request, 'castle/project.html')
