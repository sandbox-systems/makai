# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from vcs.vcs import *


def projects(request):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)
    # request.session.flush()
    # repos = dict()
    # repos = merge_dicts(accounts['bitbucket'].get_repos(),accounts['github'].get_repos())
    repos = accounts['bitbucket'].get_repos()
    # print request.session['github_token']
    return render(request, 'castle/projects.html', {'repos': repos})


def project(request, host, owner, repo, branch, path):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)
    items = accounts[host].get_repo(owner, repo, branch, path)
    # branches = accounts[host].get_branches(owner, repo)
    return render(request, 'castle/project.html',
                  {'entries': items, 'repoName': repo, 'repoHost': host, 'repoOwner': owner, 'repoBranch': branch})
