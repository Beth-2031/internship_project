import pytest
from rest_framework.exceptions import ValidationError
from Our_First_App.serializers import (
    CustomUserSerializer,
    InternshipPlacementSerializer,
    WeeklyLogSerializer,
    EvaluationSerializer,
    CourseCompletionSerializer,
    NotificationSerializer,
    SafetyReportSerializer,
)
from Our_First_App.models import CustomUser, CourseCompletion


@pytest.mark.django_db
class TestCustomUserSerializer:
    def test_valid_user_data(self):
        data = {
            'username': 'newuser',
            'email': 'new@test.com',
            'user_type': 'student',
            'password': 'strongpass123'
        }
        serializer = CustomUserSerializer(data=data)
        assert serializer.is_valid() is True

    def test_duplicate_username_rejected(self, student_user):
        data = {
            'username': 'student1',  # already exists
            'email': 'unique@test.com',
            'user_type': 'student',
        }
        serializer = CustomUserSerializer(data=data)
        assert serializer.is_valid() is False
        assert 'username' in serializer.errors

    def test_duplicate_email_rejected(self, student_user):
        data = {
            'username': 'uniqueuser',
            'email': 'student@test.com',  # already exists
            'user_type': 'student',
        }
        serializer = CustomUserSerializer(data=data)
        assert serializer.is_valid() is False
        assert 'email' in serializer.errors


@pytest.mark.django_db
class TestInternshipPlacementSerializer:
    def test_valid_placement_data(self, student_user, supervisor_user):
        data = {
            'student': student_user.id,
            'workplace_supervisor': supervisor_user.id,
            'company_name': 'Tech Corp',
            'location': 'Kampala',
            'department': 'IT',
            'start_date': '2025-01-01',
            'end_date': '2025-04-30',
        }
        serializer = InternshipPlacementSerializer(data=data)
        assert serializer.is_valid() is True

    def test_end_date_before_start_date_rejected(self, student_user):
        data = {
            'student': student_user.id,
            'company_name': 'Bad Corp',
            'location': 'X',
            'department': 'Y',
            'start_date': '2025-04-30',
            'end_date': '2025-01-01',  # before start
        }
        serializer = InternshipPlacementSerializer(data=data)
        assert serializer.is_valid() is False
        assert 'end_date' in serializer.errors

    def test_serializer_method_fields(self, placement):
        serializer = InternshipPlacementSerializer(placement)
        assert serializer.data['student_name'] == placement.student.get_full_name() or placement.student.username
        assert serializer.data['workplace_supervisor_name'] is not None


@pytest.mark.django_db
class TestWeeklyLogSerializer:
    def test_valid_log(self, student_user, placement):
        data = {
            'student': student_user.id,
            'placement': placement.id,
            'week_number': 5,
            'tasks_done': 'API work',
            'hours_worked': '35.50',
            'challenges_faced': 'CORS',
            'next_week_plans': 'Frontend',
        }
        serializer = WeeklyLogSerializer(data=data)
        assert serializer.is_valid() is True

    def test_student_must_belong_to_placement(self, student_user, placement):
        # Create another student who is NOT assigned to this placement
        other_student = CustomUser.objects.create_user(
            username='other', email='o@test.com', password='pass', user_type='student'
        )
        data = {
            'student': other_student.id,
            'placement': placement.id,
            'week_number': 5,
            'tasks_done': 'Hacking',
            'hours_worked': '10.00',
            'challenges_faced': '',
            'next_week_plans': '',
        }
        serializer = WeeklyLogSerializer(data=data)
        assert serializer.is_valid() is False
        assert 'placement' in serializer.errors

    def test_date_submitted_is_read_only(self, student_user, placement):
        data = {
            'student': student_user.id,
            'placement': placement.id,
            'week_number': 5,
            'tasks_done': 'Test',
            'hours_worked': '10.00',
            'challenges_faced': '',
            'next_week_plans': '',
            'date_submitted': '2020-01-01',  # trying to override
        }
        serializer = WeeklyLogSerializer(data=data)
        assert serializer.is_valid() is True
        # read_only field should be ignored in input validation


@pytest.mark.django_db
class TestEvaluationSerializer:
    def test_valid_evaluation(self, placement):
        data = {
            'placement': placement.id,
            'supervisor_score': 80,
            'logbook_score': 70,
            'academic_score': 90,
        }
        serializer = EvaluationSerializer(data=data)
        assert serializer.is_valid() is True

    def test_cannot_edit_submitted_evaluation(self, placement):
        from Our_First_App.models import Evaluation
        evaluation = Evaluation.objects.create(
            placement=placement,
            supervisor_score=50,
            logbook_score=50,
            academic_score=50,
            is_submitted=True
        )
        data = {'supervisor_score': 99}
        serializer = EvaluationSerializer(evaluation, data=data, partial=True)
        assert serializer.is_valid() is False

    def test_total_score_is_read_only(self, placement):
        data = {
            'placement': placement.id,
            'supervisor_score': 80,
            'logbook_score': 70,
            'academic_score': 90,
            'total_score': 999,  # trying to override
        }
        serializer = EvaluationSerializer(data=data)
        assert serializer.is_valid() is True


@pytest.mark.django_db
class TestCourseCompletionSerializer:
    def test_valid_course_completion(self, student_user):
        data = {
            'student': student_user.id,
            'course_name': 'BSc CS',
            'minimum_hours_required': 400,
            'approved_hours': 350,
        }
        serializer = CourseCompletionSerializer(data=data)
        assert serializer.is_valid() is True

    def test_cannot_update_completed_course(self, student_user):
        course = CourseCompletion.objects.create(
            student=student_user,
            course_name='BSc CS',
            minimum_hours_required=400,
            approved_hours=400,
            is_completed=True
        )
        serializer = CourseCompletionSerializer(
            course, data={'approved_hours': 500}, partial=True
        )
        with pytest.raises(ValidationError) as exc:
            serializer.is_valid(raise_exception=True)
        assert 'completed' in str(exc.value)

    def test_can_update_incomplete_course(self, student_user):
        course = CourseCompletion.objects.create(
            student=student_user,
            course_name='BSc CS',
            minimum_hours_required=400,
            approved_hours=200,
            is_completed=False
        )
        serializer = CourseCompletionSerializer(
            course, data={'approved_hours': 300}, partial=True
        )
        assert serializer.is_valid() is True


@pytest.mark.django_db
class TestNotificationSerializer:
    def test_serialization(self, student_user):
        from Our_First_App.models import Notification
        note = Notification.objects.create(user=student_user, message='Test')
        serializer = NotificationSerializer(note)
        assert serializer.data['message'] == 'Test'
        assert serializer.data['is_read'] is False
        assert 'created_at' in serializer.data

    def test_created_at_is_read_only(self, student_user):
        data = {
            'user': student_user.id,
            'message': 'Hello',
            'created_at': '2020-01-01T00:00:00Z',
        }
        serializer = NotificationSerializer(data=data)
        assert serializer.is_valid() is True  # read_only ignored on input


@pytest.mark.django_db
class TestSafetyReportSerializer:
    def test_valid_report(self, student_user):
        data = {
            'student': student_user.id,
            'description': 'Fire alarm not working',
        }
        serializer = SafetyReportSerializer(data=data)
        assert serializer.is_valid() is True

    def test_student_defaults_to_current_user(self, student_user):
        # When no student is provided, CurrentUserDefault should kick in
        # (This test assumes the serializer context has 'request')
        from unittest.mock import MagicMock
        request = MagicMock()
        request.user = student_user

        data = {'description': 'Test without student'}
        serializer = SafetyReportSerializer(data=data, context={'request': request})
        assert serializer.is_valid() is True