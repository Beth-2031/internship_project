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
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
]
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('dashboard/', views.student_dashboard, name='dashboard'),

    path('placements/', views.placement_list, name='placement_list'),
    path('placements/<int:pk>/', views.placement_detail, name='placement_detail'),

    path('logs/', views.weekly_logs, name='weekly_logs'),
    path('logs/<int:pk>/', views.log_detail, name='log_detail'),

    path('reports/', views.safety_reports, name='safety_reports'),
    path('reports/<int:pk>/', views.report_detail, name='report_detail'),

    path('courses/', views.course_list, name='course_list'),
    path('courses/<int:pk>/', views.course_detail, name='course_detail'),
]