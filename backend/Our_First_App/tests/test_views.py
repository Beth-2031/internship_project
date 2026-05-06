import pytest
from Our_First_App.models import Notification


@pytest.mark.django_db
class TestAuthentication:
    def test_register_creates_user(self, client):
        response = client.post('/api/register/', {
            'email': 'newuser@test.com',
            'password': 'strongpass123',
            'role': 'student',
            'full_name': 'New User'
        }, format='json')
        # register_view returns 200 (not 201) on success
        assert response.status_code == 200
        assert response.data['message'] == 'Registration successful'


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


@pytest.mark.django_db
class TestNotification:
    def test_mark_read(self, auth_client, student_user):
        note = Notification.objects.create(user=student_user, message='Unread')
        response = auth_client.patch(f'/api/notifications/{note.id}/', {
            'is_read': True
        }, format='json')
        assert response.status_code == 200
        note.refresh_from_db()
        assert note.is_read is True
