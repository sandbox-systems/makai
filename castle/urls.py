from django.conf.urls import url
from django.contrib import admin
from . import views

urlpatterns = [
    url(r'^$', views.projects, name="Projects"),
    url(r'(?P<host>[a-z]+)/(?P<owner>[^\/]+)/(?P<repo>[^\/]+)/(?P<branch>[^\/]+)/(?P<path>.*)$', views.project,
        name="Project"),
    url(r'^createRepo$', views.create_repo),
    url(r'^deleteRepo$', views.delete_repo),
    url(r'^editRepoName$', views.rename_repo),
    url(r'^editRepoDes', views.edit_repo_des),
    url(r'^createBranch', views.create_branch)
]
