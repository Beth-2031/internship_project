import pytest
from rest_framework.test import APIClient
from Our_First_App.models import CustomUser, InternshipPlacement, WeeklyLog


@pytest.fixture
def student_user(db):
    return CustomUser.objects.create_user(
        username='student1',
        email='student@test.com',
        password='testpass123',
        user_type='student',
        course='BSc Computer Science',
        department='Faculty of Computing'
    )


@pytest.fixture
def supervisor_user(db):
    return CustomUser.objects.create_user(
        username='supervisor1',
        email='supervisor@test.com',
        password='testpass123',
        user_type='workplace_supervisor'
    )


@pytest.fixture
def admin_user(db):
    return CustomUser.objects.create_user(
        username='admin1',
        email='admin@test.com',
        password='testpass123',
        user_type='internship_admin'
    )


@pytest.fixture
def placement(db, student_user, supervisor_user):
    return InternshipPlacement.objects.create(
        student=student_user,
        workplace_supervisor=supervisor_user,
        company_name='Tech Corp',
        location='Kampala',
        department='IT',
        start_date='2025-01-01',
        end_date='2025-04-30'
    )


@pytest.fixture
def weekly_log(db, student_user, placement):
    return WeeklyLog.objects.create(
        student=student_user,
        placement=placement,
        week_number=1,
        tasks_done='Built login page',
        hours_worked=40.00,
        challenges_faced='None',
        next_week_plans='Build dashboard'
    )


@pytest.fixture
def auth_client(student_user):
    client = APIClient()
    client.force_authenticate(user=student_user)
    return client


@pytest.fixture
def supervisor_client(supervisor_user):
    client = APIClient()
    client.force_authenticate(user=supervisor_user)
    return client