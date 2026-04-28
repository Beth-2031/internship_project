from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class Notification(models.Model):
    user = models.ForeignKey('Our_First_App.CustomUser', on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:20]}..."




class CustomUser(AbstractUser):
    USER_TYPES = [
        ('student', 'Student'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('internship_admin', 'Internship Administrator')
    ]
    user_type = models.CharField(max_length=30, choices=USER_TYPES, default='student')
    skills = models.TextField(blank=True, null=True)
    course = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.user_type})"


class InternshipPlacement(models.Model):
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='placements',
        limit_choices_to={'user_type': 'student'}
    )
    workplace_supervisor = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='supervised_placements',
        limit_choices_to={'user_type': 'workplace_supervisor'}
    )
    academic_supervisor = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='academic_placements',
        limit_choices_to={'user_type': 'academic_supervisor'}
    )
    company_name = models.CharField(max_length=200, blank=False, null=False)
    location = models.CharField(max_length=200, blank=False, null=False)
    department = models.CharField(max_length=200, blank=False, null=False)
    start_date = models.DateField()
    end_date = models.DateField()
    is_approved = models.BooleanField(default=False, null=False)

    def __str__(self):
        return f"{self.student} - {self.company_name}"


class WeeklyLog(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='weekly_logs',
        limit_choices_to={'user_type': 'student'}
    )
    placement = models.ForeignKey(
        InternshipPlacement,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    week_number = models.IntegerField()
    tasks_done = models.TextField()
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, null=False)
    challenges_faced = models.TextField()
    next_week_plans = models.TextField()
    date_submitted = models.DateField(auto_now_add=True)
    is_verified = models.BooleanField(default=False, null=False)

    submission_deadline = models.DateField(null=True, blank=True)
    
    class Meta:
        unique_together = ['student', 'placement', 'week_number']
        ordering = ['week_number']

    def is_locked(self):
        """Lock editing onc verified/approved."""
        return self.is_verified

    def __str__(self):
        return f"Week {self.week_number} - {self.student}"
    
class SupervisorReview(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]    
    log = models.OneToOneField(
        WeeklyLog,
        on_delete=models.CASCADE,
        related_name='review'
    )
    supervisor = models.ForeignKey(
    CustomUser,
    on_delete=models.SET_NULL,
    null=True,
    related_name='reviews_given'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    comments =models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    previous_status = models.CharField(max_length=10, blank=True, null=True)

    def approve(self, supervisor):
        """Approve the log and lock it."""
        self.previous_status = self.status
        self.status = 'approved'
        self.supervisor = supervisor
        self.reviewed_at = timezone.now()
        self.log.is_verified = True
        self.log.save()
        self.save()

    def reject(self, supervisor, comments=''):
        """Reject the log with comments."""
        self.previous_status = self.status
        self.status = 'rejected'
        self.supervisor = supervisor
        self.comments = comments
        self.reviewed_at = timezone.now()
        self.save()

    def __str__(self):
        return f"Review for {self.log} - {self.status}"
    
class SafetyReport(models.Model):
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='safety_reports',
        limit_choices_to={'user_type': 'student'}
    )
    description = models.TextField(blank=False, null=False)
    date_reported = models.DateField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False, null=False)

    def __str__(self):
        return f"Safety Report - {self.student} ({self.date_reported})"


class CourseCompletion(models.Model):
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='course_completions',
        limit_choices_to={'user_type': 'student'}
    )
    course_name = models.CharField(max_length=200, blank=False, null=False)
    minimum_hours_required = models.IntegerField()
    approved_hours = models.IntegerField()
    is_completed = models.BooleanField(default=False, null=False)

    def __str__(self):
        return f"{self.student} - {self.course_name}"