import pytest
from unittest.mock import patch
from Our_First_App.models import Notification, WeeklyLog


@pytest.mark.django_db
class TestAuthentication:
    def test_register_creates_user(self, client):
        response = client.post('/api/register/', {
            'username': 'newuser',
            'email': 'new@test.com',
            'password': 'strongpass123',
            'user_type': 'student',
            'full_name': 'New User'
        }, format='json')
        assert response.status_code == 201

    def test_login_returns_token(self, client, student_user):
        response = client.post('/api/login/', {
            'username': 'student1',
            'password': 'testpass123'
        }, format='json')
        assert response.status_code == 200
        assert 'token' in response.data or 'key' in response.data


@pytest.mark.django_db
class TestInternshipPlacement:
    def test_student_can_create_placement(self, auth_client):
        response = auth_client.post('/api/placements/', {
            'company_name': 'New Corp',
            'location': 'Nairobi',
            'department': 'Engineering',
            'start_date': '2025-06-01',
            'end_date': '2025-09-01'
        }, format='json')
        assert response.status_code == 201

    def test_student_sees_only_own_placements(self, auth_client, placement, student_user):
        # Create another student's placement
        from Our_First_App.models import CustomUser
        other = CustomUser.objects.create_user(
            username='other', email='o@test.com', password='pass', user_type='student'
        )
        from Our_First_App.models import InternshipPlacement
        InternshipPlacement.objects.create(
            student=other, company_name='Other', location='X',
            department='Y', start_date='2025-01-01', end_date='2025-04-01'
        )

        response = auth_client.get('/api/placements/')
        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['company_name'] == 'Tech Corp'


@pytest.mark.django_db
class TestWeeklyLog:
    def test_student_can_submit_log(self, auth_client, placement):
        response = auth_client.post('/api/weekly-logs/', {
            'placement': placement.id,
            'week_number': 2,
            'tasks_done': 'API work',
            'hours_worked': 35.50,
            'challenges_faced': 'CORS issues',
            'next_week_plans': 'Frontend integration'
        }, format='json')
        assert response.status_code == 201

    def test_negative_hours_rejected(self, auth_client, placement):
        response = auth_client.post('/api/weekly-logs/', {
            'placement': placement.id,
            'week_number': 2,
            'tasks_done': 'Bad data',
            'hours_worked': -5.00,
            'challenges_faced': '',
            'next_week_plans': ''
        }, format='json')
        assert response.status_code == 400


@pytest.mark.django_db
class TestNotification:
    def test_list_returns_only_user_notifications(self, auth_client, student_user):
        Notification.objects.create(user=student_user, message='Test 1')
        Notification.objects.create(user=student_user, message='Test 2')

        response = auth_client.get('/api/notifications/')
        assert response.status_code == 200
        assert len(response.data) == 2

    def test_mark_read(self, auth_client, student_user):
        note = Notification.objects.create(user=student_user, message='Unread')
        response = auth_client.patch(f'/api/notifications/{note.id}/', {
            'is_read': True
        }, format='json')
        assert response.status_code == 200
        note.refresh_from_db()
        assert note.is_read is True