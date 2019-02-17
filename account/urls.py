from django.conf.urls import url
from django.contrib import admin
from . import views

urlpatterns = [
    url(r'login$', views.login, name="Login"),
    url(r'login/callback', views.login_callback, name="LoginCallback"),
    url(r'username/$', views.settings, name="Settings"),
    url(r'username/sync$', views.sync, name="Sync"),
    url(r'username/sync/callback/(?P<host>[a-z]+)', views.sync_callback, name="SyncCallback")
]
