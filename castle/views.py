# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpResponse, HttpResponseServerError
from django.shortcuts import render, redirect
from vcs.vcs import *
from json import dumps as json_dump


def projects(request):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)
    # request.session.flush()
    repos = dict()
    for host, account in accounts.items():
        repos = merge_dicts(repos, account.get_repos())
    if request.method == 'GET':
        return render(request, 'castle/projects.html', {'repos': repos})
    else:
        return HttpResponse(json_dump(repos), 'application/json')


# Used as endpoint, so returns HttpResponse
def full_project(request, host, owner, repo, branch):
    if not init_tokens(request):
        # TODO determine better way to deal with unsynced since this is an endpoint
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)
    contents = accounts[host].get_full_repo(owner, repo, branch)
    return HttpResponse(json_dump(contents), 'application/json')


def project(request, host, owner, repo, branch, path):
    # TODO make into decorator
    if not init_tokens(request, require_host=host):
        # TODO display message in sync page saying you need to sync before trying whatever action was attempted?
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)
    items = accounts[host].get_repo(owner, repo, branch, path)
    branches = accounts[host].get_branches(owner, repo)
    return render(request, 'castle/project.html',
                  {'entries': items, 'repoName': repo, 'repoHost': host, 'repoOwner': owner, 'repoBranch': branch,
                   'branches': branches, 'filepath': path})


def vcs_action(request, action):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)

    data = request.POST

    host = data[u'host']
    owner = data[u'owner']
    repo = data[u'repo']
    branch = data[u'branch']
    uid = request.session.get('uid')

    if action == 'newfile':
        path = data[u'path']
        filename = data[u'name']
        create_file(host, owner, repo, branch, path, filename)
    elif action == 'newfolder':
        path = data[u'path']
        folder_name = data[u'name']
        print(folder_name)
    elif action == 'newrepo':
        repo_name = data[u'name']
        # TODO handle
    elif action == 'commit':
        commit_msg = data[u'message']
        print(commit_msg)

    return HttpResponse()


def create_repo(request):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)

    is_private = request.GET['is_private']
    host = request.GET['host']
    name = request.GET['name']

    accounts[host].create_repo(name, is_private)

    return HttpResponse()


def delete_repo(request):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)

    host = request.GET['host']
    name = request.GET['name']
    owner = request.GET['owner']

    accounts[host].delete_repo(name, owner)

    return HttpResponse()


def rename_repo(request):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)

    host = request.GET['host']
    name = request.GET['name']
    owner = request.GET['owner']
    newRepoName = request.GET['newName']

    accounts[host].rename_repo(name, owner, newRepoName)
    return HttpResponse()


def edit_repo_des(request):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)

    host = request.GET['host']
    name = request.GET['name']
    owner = request.GET['owner']
    newRepoDes = request.GET['newDes']

    accounts[host].edit_repo_des(name, owner, newRepoDes)
    return HttpResponse()


def create_branch(request):
    if not init_tokens(request):
        return redirect('account:Sync')
    init_vcs(exclude_unsynced=True)
    auth_vcs(request)

    host = request.GET['host']
    name = request.GET['name']
    currentBranch = request.GET['currentBranch']
    owner = request.GET['repoOwner']
    repoName = request.GET['repoName']

    accounts[host].edit_repo_des(name, currentBranch, owner, repoName)
    return HttpResponse()
