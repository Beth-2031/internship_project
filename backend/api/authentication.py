from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import NotAuthenticated

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        # 100% bypass CSRF for all API requests
        return

    def authenticate(self, request):
        # First try to authenticate with session
        result = super().authenticate(request)
        if result:
            return result

        # If session auth fails, still allow (we'll handle permissions separately)
        return None
