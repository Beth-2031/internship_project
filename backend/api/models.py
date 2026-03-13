from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    USER_TYPES = [
        ('student', 'Student'),
        ('workplace_supervisor','Workplace Supervisor')
        ('academic_supervisor','Academic Supervisor')
        ('intership_admin','Intership Administrator')
    ]
    user_type = models.CharField(max_length=30, choices=USER_TYPE, default='student')
    skills = models.TextFeild(blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.user_type})"
    class IntershipPlacement(models.Model):
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
        company_name = models.CharField(max_length=200)
        location = models.CharField(max_length=200)
        department = models.CharField(max_length=200)
        start_date = models.DateField()
        end_date = models.dateField()
        is_approved = models.BooleanField(defalt=False)

        def __str__(self):
            return f"{self.student} - {self.company_name}"
        
    class WeeklyLog(models.Model):
        student = models.ForeignKey(
            CustomUser,
            on_delete=models.CASCADE,
            related_name='weekly_logs,'
            limit_choices_to={'user_type': 'student'}
        )
        placement = models.ForeignKey(
            InternshipPLacement,
            on_delete=models.CASCADE,
            related_name='logs'
        )
        week_number = models.IntergerField()
        tasks_done = models.TextFeild()
        hours_worked = models.DecimalField(max_digits=5, decimal_places=2)
        challenges_faced = models.TextField()
        next_week_plans = models.TextField()
        date_submitted = models.DateField()
        is_verified =models.BooleanField(default=False)
        class Meta:
            unique_together =['student','placement','week_number']
            ordering = ['week_number']

        def __str__(self):
            return f"Week {self.week_number} - {self.student}"
    class SafetyReport(models.Model):
        student = models.ForeignKey(
            CustomUser,
            on_delete=models.CASCADE,
            related_name='safety_reports'
            limit_choices_to={'user_type': 'student'}
        )
        description = models.TextField()
        date_reported = models.DateField(auto_now_add=True)
        is_resolved = models.BooleanField(default=False)

        def __str__(self):
            return f"Safety Report - {self.student} ({self.date_reported})"
        
    class CourseCompletion(models.Model):
        student = models.ForeignKey(
            CustomUser,
            on_delete=models.CASCADE,
            related_name='safety_reports'
            limit_choices_to={'user_type': 'student'}    
        )
        course_name = models.CharField(max_length=200)
        minimum_hours_required = models.InterField()
        approved_hours = models.IntegerField()
        is_completed = models.BooleanField(default=False)

        def __str__(self):
            return f"{self.student} - {self.course_name}"
