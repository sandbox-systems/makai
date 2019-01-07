# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render


def notifications(request):
    return render(request, 'notifications/notifications.html')
