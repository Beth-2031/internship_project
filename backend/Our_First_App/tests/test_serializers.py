import pytest
from rest_framework.exceptions import ValidationError
from Our_First_App.serializers import (
    CustomUserSerializer,
    InternshipPlacementSerializer,
    CourseCompletionSerializer,
)
from Our_First_App.models import CustomUser, CourseCompletion


@pytest.mark.django_db
class TestCustomUserSerializer:
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


@pytest.mark.django_db
class TestCourseCompletionSerializer:
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
        assert serializer.is_valid() is True
        # ValidationError is raised during .save() / .update(), not .is_valid()
        with pytest.raises(ValidationError):
            serializer.save()
