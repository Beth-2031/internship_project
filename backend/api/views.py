from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import (
    CustomUser,
    InternshipPlacement,
    WeeklyLog,
    SafetyReport,
    CourseCompletion
)

def home(request):
    return render(request, "home.html")

def student_dashboard(request):
    placements = InternshipPlacement.objects.filter(student=request.user)
    logs = WeeklyLog.objects.filter(student=request.user)
    reports = SafetyReport.objects.filter(student=request.user)
    courses = CourseCompletion.objects.filter(student=request.user)

    context = {
        "placements": placements,
        "logs": logs,
        "reports": reports,
        "courses": courses
    }
    return render(request, "student/dashboard.html", context)

def placement_list(request):
    placements = InternshipPlacement.objects.all()
    return render(request, "placements/list.html", {"placements": placements})


def placement_detail(request, pk):
    placement = get_object_or_404(InternshipPlacement, pk=pk)
    return render(request, "placements/detail.html", {"placement": placement})


def weekly_logs(request):
    logs = WeeklyLog.objects.filter(student=request.user)
    return render(request, "logs/list.html", {"logs": logs})


@login_required
def log_detail(request, pk):
    log = get_object_or_404(WeeklyLog, pk=pk)
    return render(request, "logs/detail.html", {"log": log})


def safety_reports(request):
    reports = SafetyReport.objects.filter(student=request.user)
    return render(request, "reports/list.html", {"reports": reports})



def report_detail(request, pk):
    report = get_object_or_404(SafetyReport, pk=pk)
    return render(request, "reports/detail.html", {"report": report})



def course_list(request):
    courses = CourseCompletion.objects.filter(student=request.user)
    return render(request, "courses/list.html", {"courses": courses})



def course_detail(request, pk):
    course = get_object_or_404(CourseCompletion, pk=pk)
    return render(request, "courses/detail.html", {"course": course})