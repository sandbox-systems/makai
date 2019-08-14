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
    print(repos);
    return render(request, 'castle/projects.html', {'repos': repos})


def project(request, host, owner, repo, branch, path):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)
    contents = accounts[host].get_repo(owner, repo, branch, path)
    return render(request, 'castle/project.html', {'contents': contents})


# Used as endpoint, so returns HttpResponse
def full_project(request, host, owner, repo, branch):
    if not init_tokens(request):
        # TODO determine better way to deal with unsynced since this is an endpoint
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)
    contents = accounts[host].get_full_repo(owner, repo, branch)
    return HttpResponse(json_dump(contents), 'application/json')
