from django.urls import path
from . import views

urlpatterns = [
    # DASHBOARD
    path('', views.dashboard, name='dashboard'),

    # INTERNSHIP PLACEMENT
    
    path('placement/create/', views.create_placement, name='create_placement'),
    path('placement/approve/<int:placement_id>/', views.approve_placement, name='approve_placement'),

    # WEEKLY LOGS
    
    path('log/create/<int:placement_id>/', views.create_weekly_log, name='create_weekly_log'),
    path('log/verify/<int:log_id>/', views.verify_log, name='verify_log'),

    
    # SAFETY REPORT
    
    path('safety/report/', views.report_safety_issue, name='report_safety'),
    path('safety/resolve/<int:report_id>/', views.resolve_safety_issue, name='resolve_safety'),

    
    path('course/add/', views.add_course, name='add_course'),
]