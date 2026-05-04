import pytest
from django.db.utils import IntegrityError
from Our_First_App.models import SupervisorReview, SafetyReport, Evaluation


@pytest.mark.django_db
class TestWeeklyLog:
    def test_is_locked_when_verified(self, weekly_log):
        weekly_log.is_verified = True
        weekly_log.save()
        assert weekly_log.is_locked() is True

    def test_is_not_locked_when_draft(self, weekly_log):
        assert weekly_log.is_locked() is False

    def test_unique_together_constraint(self, weekly_log, student_user, placement):
        with pytest.raises(IntegrityError):
            # Same student, placement, week_number should fail
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

    def test_ordering_by_week_number(self, student_user, placement):
        from Our_First_App.models import WeeklyLog
        WeeklyLog.objects.create(
            student=student_user, placement=placement, week_number=3,
            tasks_done='Week 3', hours_worked=10, challenges_faced='', next_week_plans=''
        )
        WeeklyLog.objects.create(
            student=student_user, placement=placement, week_number=1,
            tasks_done='Week 1', hours_worked=10, challenges_faced='', next_week_plans=''
        )
        logs = list(WeeklyLog.objects.filter(placement=placement))
        week_numbers = [l.week_number for l in logs]
        assert week_numbers == [1, 1, 3]  # week_log fixture has week 1, plus 1 and 3


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

    def test_reject_does_not_verify_log(self, weekly_log, supervisor_user):
        review = SupervisorReview.objects.create(log=weekly_log)
        review.reject(supervisor_user, comments='Incomplete work')

        review.refresh_from_db()
        weekly_log.refresh_from_db()

        assert review.status == 'rejected'
        assert review.comments == 'Incomplete work'
        assert weekly_log.is_verified is False

    def test_previous_status_tracked(self, weekly_log, supervisor_user):
        review = SupervisorReview.objects.create(log=weekly_log)
        review.approve(supervisor_user)
        assert review.previous_status == 'pending'


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

    def test_submitted_at_set_on_submit(self, placement):
        evaluation = Evaluation.objects.create(placement=placement, is_submitted=True)
        assert evaluation.submitted_at is not None


@pytest.mark.django_db
class TestSafetyReport:
    def test_default_not_resolved(self, student_user):
        report = SafetyReport.objects.create(student=student_user, description='Fire hazard')
        assert report.is_resolved is False

    def test_str_representation(self, student_user):
        report = SafetyReport.objects.create(student=student_user, description='Test')
        assert 'Safety Report' in str(report)