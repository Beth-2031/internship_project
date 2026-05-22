import logging
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification, InternshipPlacement, CustomUser, SafetyReport, WeeklyLog, SupervisorReview, CourseCompletion

logger = logging.getLogger(__name__)


@receiver(post_save, sender=InternshipPlacement)
def notify_on_placement_change(sender, instance, created, **kwargs):
    """Notify all admins when a new placement is requested, and notify student when approved."""
    if created:
        # Only notify if it's a real request (not the TBD placeholder created during registration)
        if instance.company_name != 'TBD':
            admins = CustomUser.objects.filter(models.Q(user_type='internship_admin') | models.Q(is_superuser=True)).distinct()
            for admin in admins:
                create_notification(
                    admin,
                    f"New placement request from {instance.student.username} at {instance.company_name}."
                )
    else:
        # Detect if it was updated from TBD to a real company (Requesting placement)
        # Since we don't have old values, we check if it's not approved and not TBD
        if not instance.is_approved and instance.company_name != 'TBD':
            msg = f"Placement request update from {instance.student.username} at {instance.company_name}."
            # Only send if not recently notified to avoid spam on every edit
            if not Notification.objects.filter(user__user_type='internship_admin', message=msg, created_at__gte=timezone.now() - timezone.timedelta(minutes=5)).exists():
                admins = CustomUser.objects.filter(models.Q(user_type='internship_admin') | models.Q(is_superuser=True)).distinct()
                for admin in admins:
                    create_notification(admin, msg)

        # Notify student when approved
        if instance.is_approved:
            msg = f"Your placement at {instance.company_name} has been approved."
            if not Notification.objects.filter(user=instance.student, message=msg).exists():
                create_notification(instance.student, msg)


@receiver(post_save, sender=WeeklyLog)
def handle_log_submission_and_verification(sender, instance, created, **kwargs):
    """Handle notifications for log submission."""
    if instance.status == 'submitted' and not instance.is_verified:
        # Ensure a review object exists
        SupervisorReview.objects.get_or_create(
            log=instance,
            defaults={'status': 'pending'}
        )
        
        # Notify supervisors on submission
        msg = f"New log submitted by {instance.student.username} for Week {instance.week_number}."
        
        # Prevent duplicate notifications within a short window for the same log
        if not Notification.objects.filter(message=msg, created_at__gte=timezone.now() - timezone.timedelta(minutes=1)).exists():
            supervisors = []
            if instance.placement.workplace_supervisor:
                supervisors.append(instance.placement.workplace_supervisor)
            if instance.placement.academic_supervisor:
                supervisors.append(instance.placement.academic_supervisor)
            
            for supervisor in supervisors:
                create_notification(supervisor, msg)


@receiver(post_save, sender=SupervisorReview)
def notify_student_on_review(sender, instance, created, **kwargs):
    """Notify student when their log is verified (approved) with feedback."""
    if instance.status == 'approved':
        comments = instance.comments or ""
        msg = f"Your Week {instance.log.week_number} log has been verified."
        if comments:
            msg += f" Feedback: {comments[:50]}..."
        
        # Check if notification for THIS specific log has been sent to avoid duplicates
        # We search for the log number in the message or use a more specific search
        if not Notification.objects.filter(user=instance.log.student, message__contains=f"Week {instance.log.week_number}").filter(message__contains="verified").exists():
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


@receiver(post_save, sender=SupervisorReview)
def update_course_completion_on_approval(sender, instance, **kwargs):
    """Update CourseCompletion approved hours when a log is approved."""
    if instance.status == 'approved':
        student = instance.log.student
        # Get all verified logs for this student
        verified_logs = WeeklyLog.objects.filter(student=student, is_verified=True)
        total_approved_hours = verified_logs.aggregate(total=models.Sum('hours_worked'))['total'] or 0
        
        # Update or create CourseCompletion record
        completion, created = CourseCompletion.objects.get_or_create(
            student=student,
            defaults={
                'course_name': student.course or 'Internship Program',
                'minimum_hours_required': 400, # Default if not set
                'approved_hours': 0,
                'is_completed': False
            }
        )
        
        completion.approved_hours = int(total_approved_hours)
        if completion.approved_hours >= completion.minimum_hours_required:
            if not completion.is_completed:
                completion.is_completed = True
        completion.save()


@receiver(post_save, sender=CourseCompletion)
def notify_on_course_completion(sender, instance, created, **kwargs):
    """Send a congratulatory email when a student completes their placement requirements."""
    # We want to detect when is_completed becomes True
    # If it's already True, we should check if we already notified
    if instance.is_completed:
        subject = "Congratulations on Completing Your Internship Placement!"
        message = (
            f"Dear {instance.student.first_name or instance.student.username},\n\n"
            f"Congratulations! You have successfully completed the requirements for your internship placement: {instance.course_name}.\n\n"
            f"You have reached {instance.approved_hours} approved hours, meeting the minimum requirement of {instance.minimum_hours_required} hours.\n\n"
            "This is a significant milestone in your professional development. Well done!\n\n"
            "Best regards,\n"
            "Internship Management Team"
        )
        
        # Use our notification system
        msg_text = f"Congratulations! You have completed your internship requirements for {instance.course_name}."
        
        # Avoid duplicate notifications
        if not Notification.objects.filter(user=instance.student, message=msg_text).exists():
            # Create notification (this will trigger the email via the other signal)
            # However, the user specifically asked for a congratulatory email.
            # The existing send_notification_email signal uses 'New Notification' as subject.
            # We might want to send a more special email here.
            
            recipient_list = [instance.student.email]
            if recipient_list[0]:
                try:
                    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list, fail_silently=False)
                    # Also create a notification so they see it in the app
                    create_notification(instance.student, msg_text)
                except Exception as e:
                    logger.error(f"Failed to send congratulatory email to {instance.student.email}: {e}")


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