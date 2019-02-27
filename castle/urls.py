from django.conf.urls import url
from django.contrib import admin
from . import views

urlpatterns = [
    url(r'^$', views.projects, name="Projects"),
    url(r'(?P<host>[a-z]+)/(?P<owner>[^\/]+)/(?P<repo>[^\/]+)/(?P<branch>[^\/]+)/(?P<path>.*)$', views.project,
        name="Project")
]
