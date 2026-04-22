from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden

from .models import (
    CustomUser,
    InternshipPlacement,
    WeeklyLog,
    SafetyReport,
    CourseCompletion
)


def role_required(role):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if request.user.user_type != role:
                return HttpResponseForbidden("You are not allowed to access this page")
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


@login_required
def redirect_user(request):
    user = request.user

    if user.user_type == 'student':
        return redirect('student_dashboard')

    elif user.user_type == 'workplace_supervisor':
        return redirect('workplace_dashboard')

    elif user.user_type == 'academic_supervisor':
        return redirect('academic_dashboard')

    elif user.user_type == 'internship_admin':
        return redirect('admin_dashboard')

    return redirect('login')


@login_required
@role_required('student')
def student_dashboard(request):
    user = request.user

    placements = InternshipPlacement.objects.filter(student=user)
    logs = WeeklyLog.objects.filter(student=user)
    reports = SafetyReport.objects.filter(student=user)
    courses = CourseCompletion.objects.filter(student=user)

    context = {
        "placements": placements,
        "logs": logs,
        "reports": reports,
        "courses": courses
    }
    return render(request, "student/dashboard.html", context)

@login_required
@role_required('workplace_supervisor')
def workplace_dashboard(request):
    user = request.user

    placements = InternshipPlacement.objects.filter(workplace_supervisor=user)
    logs = WeeklyLog.objects.filter(placement__workplace_supervisor=user)

    context = {
        "placements": placements,
        "logs": logs,
    }
    return render(request, "workplace/dashboard.html", context)


@login_required
@role_required('academic_supervisor')
def academic_dashboard(request):
    user = request.user

    placements = InternshipPlacement.objects.filter(academic_supervisor=user)
    logs = WeeklyLog.objects.filter(placement__academic_supervisor=user)

    context = {
        "placements": placements,
        "logs": logs,
    }
    return render(request, "academic/dashboard.html", context)


@login_required
@role_required('internship_admin')
def admin_dashboard(request):
    placements = InternshipPlacement.objects.all()
    students = CustomUser.objects.filter(user_type='student')

    context = {
        "placements": placements,
        "students": students,
    }
    return render(request, "admin/dashboard.html", context)


@login_required
@role_required('internship_admin')
def approve_placement(request, pk):
    placement = get_object_or_404(InternshipPlacement, pk=pk)
    placement.is_approved = True
    placement.save()

    return redirect('admin_dashboard')


@login_required
@role_required('workplace_supervisor')
def verify_log(request, pk):
    log = get_object_or_404(WeeklyLog, pk=pk)

    
    if log.placement.workplace_supervisor != request.user:
        return HttpResponseForbidden("Not your student")

    log.is_verified = True
    log.save()

    return redirect('workplace_dashboard')

def placement_detail(request, pk):
    placement = get_object_or_404(InternshipPlacement, pk=pk)
    return render(request, "placements/detail.html", {"placement": placement})


def log_detail(request, pk):
    log = get_object_or_404(WeeklyLog, pk=pk)
    return render(request, "logs/detail.html", {"log": log})