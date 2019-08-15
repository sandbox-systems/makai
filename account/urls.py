from django.conf.urls import url
from django.contrib import admin
from . import views

urlpatterns = [
    url(r'login/(?P<was_attempt_redirected>\w+)?$', views.login, name="Login"),
    url(r'logincallback', views.login_callback, name="LoginCallback"),
    url(r'logout$', views.logout, name='Logout'),
    url(r'username/$', views.settings, name="Settings"),
    url(r'username/sync$', views.sync, name="Sync"),
    url(r'username/sync/callback/(?P<host>[a-z]+)', views.sync_callback, name="SyncCallback"),
    url(r'updatetokens/(?P<host>[a-z]+)', views.update_tokens,
        name="UpdateTokens")
]
