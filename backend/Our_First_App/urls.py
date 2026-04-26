from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import InternshipPlacementViewSet , WeeklyLogViewSet, SafetyReportViewSet, CourseCompletionViewSet
from django.views.decorators.csrf import csrf_exempt
from api.views import UserViewSet
from .views import login_view

# DRF Router
router = DefaultRouter()
router.register(r'placements', InternshipPlacementViewSet, basename='placements')
router.register(r'weekly-logs', WeeklyLogViewSet, basename='weekly-logs')
router.register(r'safety-reports', SafetyReportViewSet, basename='safety-reports')
router.register(r'course-completions', CourseCompletionViewSet, basename='course-completions')
router.register(r'users', UserViewSet, basename='users') 

urlpatterns = [
    # ===========================
    # DASHBOARDS
    # ===========================
    path('', views.dashboard, name='dashboard'),
    path('student/', views.student_dashboard, name='student_dashboard'),
    path('workplace/', views.workplace_dashboard, name='workplace_dashboard'),
    path('academic/', views.academic_dashboard, name='academic_dashboard'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
     path('api/login/', login_view, name='login'),

    # ===========================
    # API
    # ===========================
    path('api/', include(router.urls)),

    path('log/<int:log_id>/edit/', views.edit_weekly_log, name='edit_weekly_log'),
    path('placement/<int:placement_id>/edit/', views.edit_placement, name='edit_placement'),
]