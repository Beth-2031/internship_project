from rest_framework.authentication import BaseAuthentication
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

class CsrfExemptSessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Get the user from the session without any CSRF checks
        User = get_user_model()
        if hasattr(request, 'session'):
            user_id = request.session.get('_auth_user_id')
            if user_id:
                try:
                    user = User.objects.get(pk=user_id)
                    return (user, None)
                except User.DoesNotExist:
                    pass
        # If no user found, return None (permission classes will handle it)
        return None
