import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification, InternshipPlacement, CustomUser, SafetyReport, WeeklyLog, SupervisorReview

logger = logging.getLogger(__name__)


@receiver(post_save, sender=InternshipPlacement)
def notify_on_placement_change(sender, instance, created, **kwargs):
    """Notify all admins when a new placement is requested, and notify student when approved."""
    if created:
        admins = CustomUser.objects.filter(user_type='internship_admin')
        for admin in admins:
            create_notification(
                admin,
                f"New placement request from {instance.student.username} at {instance.company_name}."
            )
    else:
        # We need to detect if is_approved just changed from False to True
        # Django signals don't natively provide 'old' values, so we check if it's currently True
        # but the notification hasn't been sent yet (or just rely on the save event for this simple logic)
        if instance.is_approved:
            msg = f"Your placement at {instance.company_name} has been approved."
            # Check if this notification already exists to avoid duplicates on every save
            if not Notification.objects.filter(user=instance.student, message=msg).exists():
                create_notification(instance.student, msg)


@receiver(post_save, sender=WeeklyLog)
def handle_log_submission_and_verification(sender, instance, created, **kwargs):
    """Handle notifications for log submission and verification."""
    # 1. Submission Logic - Only if submitted and not already verified
    if instance.status == 'submitted' and not instance.is_verified:
        # Check if a review already exists to avoid duplicate notifications
        review, review_created = SupervisorReview.objects.get_or_create(
            log=instance,
            defaults={'status': 'pending'}
        )
        
        if review_created:
            supervisors = []
            if instance.placement.workplace_supervisor:
                supervisors.append(instance.placement.workplace_supervisor)
            if instance.placement.academic_supervisor:
                supervisors.append(instance.placement.academic_supervisor)
            for supervisor in supervisors:
                create_notification(
                    supervisor,
                    f"New log submitted by {instance.student.username} for Week {instance.week_number}."
                )

    # 2. Verification Logic - Handled by SupervisorReview signal to ensure comments are captured
    pass


@receiver(post_save, sender=SupervisorReview)
def notify_student_on_review(sender, instance, created, **kwargs):
    """Notify student when their log is verified (approved) with feedback."""
    if instance.status == 'approved':
        comments = instance.comments or ""
        msg = f"Your Week {instance.log.week_number} log has been verified."
        if comments:
            msg += f" Feedback: {comments[:50]}..."
        
        # Avoid duplicate notifications if the review is saved multiple times
        if not Notification.objects.filter(user=instance.log.student, message=msg).exists():
            create_notification(instance.log.student, msg)


@receiver(post_save, sender=SafetyReport)
def notify_on_safety_report_change(sender, instance, created, **kwargs):
    """Handle notifications for safety report creation and resolution."""
    if created:
        admins = CustomUser.objects.filter(user_type='internship_admin')
        for admin in admins:
            create_notification(
                admin,
                f"New safety report from {instance.student.username}: {instance.description[:50]}..."
            )
    else:
        if instance.is_resolved:
            create_notification(
                instance.student,
                "Your safety report has been resolved."
            )


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