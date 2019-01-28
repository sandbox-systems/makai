from django.conf.urls import url
from django.contrib import admin
from . import views

urlpatterns = [
    url(r'login', views.login, name="Login"),
    url(r'callback', views.callback, name="Callback"),
    url(r'username/$', views.settings, name="Settings"),
    url(r'username/sync', views.sync, name="Sync")
]
