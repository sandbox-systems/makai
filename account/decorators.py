from django.shortcuts import redirect


def require_login(function):
    def wrap(request, *args, **kwargs):
        if 'uid' in request.session:
            return function(request, *args, **kwargs)
        else:
            # TODO pass something to display notification in login screen that you need to login first
            return redirect('account:Login', was_attempt_redirected='redirected')
    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap
