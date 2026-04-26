from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import InternshipPlacementViewSet
from .views import register_view, login_view
# DRF Router
router = DefaultRouter()
router.register(r'placements', InternshipPlacementViewSet, basename='placements')

urlpatterns = [
    # ===========================
    # DASHBOARDS
    path('api/register/', register_view),
    path('api/login/', login_view),
    path('', views.dashboard, name='dashboard'),
    path('student/', views.student_dashboard, name='student_dashboard'),
    path('workplace/', views.workplace_dashboard, name='workplace_dashboard'),
    path('academic/', views.academic_dashboard, name='academic_dashboard'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),

    # ===========================
    # API
    # ===========================
    path('api/', include(router.urls)),
]
