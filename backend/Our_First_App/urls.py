from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    InternshipPlacementViewSet,
    WeeklyLogViewSet,
    SafetyReportViewSet,
    CourseCompletionViewSet,
    NotificationViewSet,
    SupervisorReviewViewSet,
    EvaluationViewSet,
    verify_log,
    submit_log,
)
from api.views import UserViewSet

# DRF Router
router = DefaultRouter()
router.register(r'placements', InternshipPlacementViewSet, basename='placements')
router.register(r'weekly-logs', WeeklyLogViewSet, basename='weekly-logs')
router.register(r'safety-reports', SafetyReportViewSet, basename='safety-reports')
router.register(r'course-completions', CourseCompletionViewSet, basename='course-completions')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'users', UserViewSet, basename='users')
router.register(r'supervisor-review', SupervisorReviewViewSet, basename='supervisor-reviews')
router.register(r'evaluations', EvaluationViewSet, basename='evaluations')
urlpatterns = [
    # ===========================
    # DASHBOARDS
    # ===========================
    path('', views.dashboard, name='dashboard'),
    path('student/', views.student_dashboard, name='student_dashboard'),
    path('workplace/', views.workplace_dashboard, name='workplace_dashboard'),
    path('academic/', views.academic_dashboard, name='academic_dashboard'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),

    # ===========================
    # API
    # ===========================
    path('api/', include(router.urls)),
    path('log/<int:log_id>/edit/', views.edit_weekly_log, name='edit_weekly_log'),
    path('log/<int:log_id>/submit/', views.submit_log, name='submit_log'),
    path('placement/<int:placement_id>/edit/', views.edit_placement, name='edit_placement'),
]
