import pytest
from unittest.mock import patch
from Our_First_App.models import Notification, CustomUser
from Our_First_App.signals import create_notification


@pytest.mark.django_db
class TestNotificationSignals:
    @patch('Our_First_App.signals.send_mail')
    def test_email_sent_on_notification_create(self, mock_send_mail, student_user):
        Notification.objects.create(user=student_user, message='Hello')

        mock_send_mail.assert_called_once()
        args = mock_send_mail.call_args
        assert args[1]['recipient_list'] == ['student@test.com']

    @patch('Our_First_App.signals.send_mail')
    def test_no_email_for_user_without_email(self, mock_send_mail):
        user = CustomUser.objects.create_user(
            username='noemail', password='pass', user_type='student', email=''
        )
        Notification.objects.create(user=user, message='No email user')

        mock_send_mail.assert_not_called()

    def test_create_notification_helper(self, student_user):
        note = create_notification(student_user, 'Helper test')
        assert note is not None
        assert note.message == 'Helper test'
        assert note.is_read is False