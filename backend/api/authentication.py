from rest_framework.authentication import SessionAuthentication
import logging

logger = logging.getLogger(__name__)

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        logger.info("CsrfExemptSessionAuthentication: Bypassing CSRF check")
        print("=== CsrfExemptSessionAuthentication.enforce_csrf called - bypassing ===")
        return  # Do NOT enforce CSRF
