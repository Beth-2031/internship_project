import pytest
from unittest.mock import patch
from Our_First_App.models import (
    CustomUser, InternshipPlacement, WeeklyLog, SupervisorReview, CourseCompletion, Notification
)
from datetime import date, timedelta

@pytest.mark.django_db
class TestCompletionSignals:
    @patch('Our_First_App.signals.send_mail')
    def test_completion_email_sent(self, mock_send_mail):
        # 1. Create student
        student = CustomUser.objects.create_user(
            username='student_comp', 
            email='student@example.com', 
            password='password123',
            user_type='student',
            course='Computer Science'
        )
        
        # 2. Create placement
        admin = CustomUser.objects.create_user(username='admin_comp', password='password123', user_type='internship_admin')
        placement = InternshipPlacement.objects.create(
            student=student,
            company_name='Test Corp',
            location='Test City',
            department='IT',
            start_date=date.today(),
            end_date=date.today() + timedelta(days=90),
            is_approved=True
        )
        
        # 3. Create CourseCompletion with small requirement for testing
        CourseCompletion.objects.create(
            student=student,
            course_name='Computer Science',
            minimum_hours_required=10,
            approved_hours=0,
            is_completed=False
        )
        
        # 4. Create a log that meets the requirement
        log = WeeklyLog.objects.create(
            student=student,
            placement=placement,
            week_number=1,
            tasks_done='Testing signals',
            hours_worked=15,
            status='submitted'
        )
        
        # 5. Approve the log
        review, created = SupervisorReview.objects.get_or_create(log=log)
        # Clear calls from initial setup notifications if any
        mock_send_mail.reset_mock()
        
        review.approve(supervisor=admin, comments='Well done!')
        
        # 6. Verify signals triggered
        completion = CourseCompletion.objects.get(student=student)
        assert completion.approved_hours == 15
        assert completion.is_completed is True
        
        # 7. Check if congratulatory email was sent
        # It might be called multiple times (one for verification notification, one for completion)
        # We check if any call has the congratulations subject
        congrats_calls = [
            call for call in mock_send_mail.call_args_list 
            if "Congratulations on Completing Your Internship Placement!" in str(call)
        ]
        assert len(congrats_calls) > 0
        
        # 8. Check if notification record was created
        assert Notification.objects.filter(user=student, message__contains="completed your internship requirements").exists()
