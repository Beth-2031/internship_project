"""
URL configuration for backend_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from . import views

urlpatterns = [
    path('redirect/', views.redirect_user, name='redirect_user'),

    path('student/', views.student_dashboard, name='student_dashboard'),
    path('workplace/', views.workplace_dashboard, name='workplace_dashboard'),
    path('academic/', views.academic_dashboard, name='academic_dashboard'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),

    path('approve/<int:pk>/', views.approve_placement, name='approve_placement'),
    path('verify-log/<int:pk>/', views.verify_log, name='verify_log'),

    path('placement/<int:pk>/', views.placement_detail, name='placement_detail'),
    path('log/<int:pk>/', views.log_detail, name='log_detail'),
]
