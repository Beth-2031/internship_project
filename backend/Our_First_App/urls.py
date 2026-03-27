from django.urls import path
from . import views

urlpatterns = [
    path('redirect/', views.redirect_user, name='redirect_user'),

    path('student/', views.student_dashboard, name='student_dashboard'),
    path('workplace/', views.workplace_dashboard, name='workplace_dashboard'),
    path('academic/', views.academic_dashboard, name='academic_dashboard'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
]
