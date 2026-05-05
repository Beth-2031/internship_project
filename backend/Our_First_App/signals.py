import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Notification)
def send_notification_email(sender, instance, created, **kwargs):
    """Automatically send an email when a Notification is created."""
    if not created:
        return

    if not instance.user.email:
        logger.warning(f"User {instance.user.id} has no email; skipping notification email.")
        return

    subject = "New Notification"
    message = instance.message
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [instance.user.email]

    try:
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)
    except Exception as e:
        logger.error(f"Failed to send notification email to {instance.user.email}: {e}")


def create_notification(user, message):
    """Helper to create a Notification record. The signal above handles the email."""
    if not user or not message:
        return None
    return Notification.objects.create(user=user, message=message)