from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import  Notification
from django.core.mail import send_mail
from django.conf import settings


@receiver(post_save, sender= Notification)
def send_notification_email(sender, instance, created, **kwargs):
    if created:
        subject = "New Notification"
        message = instance.message
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [instance.user.email]
        fail_silently = False

        send_mail(subject, message, from_email, recipient_list, fail_silently=fail_silently)