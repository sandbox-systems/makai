from django.conf.urls import url
from django.contrib import admin
from . import views

urlpatterns = [
    url(r'login', views.login, name="Login"),
    url(r'username', views.settings, name="Settings")
]
