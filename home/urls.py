from django.conf.urls import url
from django.contrib import admin
from . import views

urlpatterns = [
    url(r'^$', views.index, name="Landing"),
    url(r'^team', views.team, name="Team"),
    url(r'^pricing', views.pricing, name="Pricing"),
    url(r'^home', views.home, name="Home")
]
