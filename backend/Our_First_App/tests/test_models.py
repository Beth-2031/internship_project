import pytest
from django.db.utils import IntegrityError
from Our_First_App.models import SupervisorReview, SafetyReport, Evaluation


@pytest.mark.django_db
class TestWeeklyLog:
    def test_is_locked_when_verified(self, weekly_log):
        weekly_log.is_verified = True
        weekly_log.save()
        assert weekly_log.is_locked() is True

    def test_unique_together_constraint(self, weekly_log, student_user, placement):
        with pytest.raises(IntegrityError):
            from Our_First_App.models import WeeklyLog
            WeeklyLog.objects.create(
                student=student_user,
                placement=placement,
                week_number=1,
                tasks_done='Duplicate',
                hours_worked=10.00,
                challenges_faced='None',
                next_week_plans='None'
            )


@pytest.mark.django_db
class TestSupervisorReview:
    def test_approve_sets_verified_and_status(self, weekly_log, supervisor_user):
        review = SupervisorReview.objects.create(log=weekly_log)
        review.approve(supervisor_user)

        review.refresh_from_db()
        weekly_log.refresh_from_db()

        assert review.status == 'approved'
        assert review.supervisor == supervisor_user
        assert review.reviewed_at is not None
        assert weekly_log.is_verified is True


@pytest.mark.django_db
class TestEvaluation:
    def test_total_score_calculation(self, placement):
        evaluation = Evaluation.objects.create(
            placement=placement,
            supervisor_score=80,
            logbook_score=70,
            academic_score=90
        )
        expected = (80 * 0.4) + (70 * 0.3) + (90 * 0.3)
        assert float(evaluation.total_score) == pytest.approx(expected)


@pytest.mark.django_db
class TestSafetyReport:
    def test_default_not_resolved(self, student_user):
        report = SafetyReport.objects.create(student=student_user, description='Fire hazard')
        assert report.is_resolved is False
