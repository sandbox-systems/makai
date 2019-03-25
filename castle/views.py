# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpResponse
from django.shortcuts import render, redirect
from vcs.vcs import *
from json import dumps as json_dump


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
    contents = accounts[host].get_repo(owner, repo, branch, path)
    if request.method == 'POST':
        return HttpResponse(json_dump(contents), 'application/json')
    else:
        return render(request, 'castle/project.html', {'contents': contents})
