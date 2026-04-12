from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import InternshipPlacementViewSet

router = DefaultRouter()
router.register(r'placements', InternshipPlacementViewSet)

urlpatterns = [
    path('redirect/', views.redirect_user, name='redirect_user'),

    path('student/', views.student_dashboard, name='student_dashboard'),
    path('workplace/', views.workplace_dashboard, name='workplace_dashboard'),
    path('academic/', views.academic_dashboard, name='academic_dashboard'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),

    path('api/', include(router.urls)),
]
