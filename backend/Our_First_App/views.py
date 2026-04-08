from django.shortcuts import render

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import (
    CustomUser,
    InternshipPlacement,
    WeeklyLog,
    SafetyReport,
    CourseCompletion
)

# ---------------------------
# DASHBOARD
# ---------------------------
@login_required
def dashboard(request):
    user = request.user

    context = {}

    if user.user_type == 'student':
        context['placements'] = InternshipPlacement.objects.filter(student=user)
        context['logs'] = WeeklyLog.objects.filter(student=user)
        context['reports'] = SafetyReport.objects.filter(student=user)
        context['courses'] = CourseCompletion.objects.filter(student=user)

    elif user.user_type == 'workplace_supervisor':
        context['placements'] = InternshipPlacement.objects.filter(workplace_supervisor=user)

    elif user.user_type == 'academic_supervisor':
        context['placements'] = InternshipPlacement.objects.filter(academic_supervisor=user)

    elif user.user_type == 'internship_admin':
        context['placements'] = InternshipPlacement.objects.all()

    return render(request, 'dashboard.html', context)


# ---------------------------
# INTERNSHIP PLACEMENT
# ---------------------------
@login_required
def create_placement(request):
    if request.method == 'POST':
        company_name = request.POST.get('company_name')
        location = request.POST.get('location')
        department = request.POST.get('department')
        start_date = request.POST.get('start_date')
        end_date = request.POST.get('end_date')

        InternshipPlacement.objects.create(
            student=request.user,
            company_name=company_name,
            location=location,
            department=department,
            start_date=start_date,
            end_date=end_date
        )

        return redirect('dashboard')

    return render(request, 'create_placement.html')


@login_required
def approve_placement(request, placement_id):
    placement = get_object_or_404(InternshipPlacement, id=placement_id)

    if request.user.user_type == 'internship_admin':
        placement.is_approved = True
        placement.save()

    return redirect('dashboard')


# ---------------------------
# WEEKLY LOGS
# ---------------------------
@login_required
def create_weekly_log(request, placement_id):
    placement = get_object_or_404(InternshipPlacement, id=placement_id)

    if request.method == 'POST':
        week_number = request.POST.get('week_number')
        tasks_done = request.POST.get('tasks_done')
        hours_worked = request.POST.get('hours_worked')
        challenges_faced = request.POST.get('challenges_faced')
        next_week_plans = request.POST.get('next_week_plans')

        WeeklyLog.objects.create(
            student=request.user,
            placement=placement,
            week_number=week_number,
            tasks_done=tasks_done,
            hours_worked=hours_worked,
            challenges_faced=challenges_faced,
            next_week_plans=next_week_plans
        )

        return redirect('dashboard')

    return render(request, 'create_weekly_log.html', {'placement': placement})


@login_required
def verify_log(request, log_id):
    log = get_object_or_404(WeeklyLog, id=log_id)

    if request.user.user_type in ['workplace_supervisor', 'academic_supervisor']:
        log.is_verified = True
        log.save()

    return redirect('dashboard')


# ---------------------------
# SAFETY REPORT
# ---------------------------
@login_required
def report_safety_issue(request):
    if request.method == 'POST':
        description = request.POST.get('description')

        SafetyReport.objects.create(
            student=request.user,
            description=description
        )

        return redirect('dashboard')

    return render(request, 'report_safety.html')


@login_required
def resolve_safety_issue(request, report_id):
    report = get_object_or_404(SafetyReport, id=report_id)

    if request.user.user_type == 'internship_admin':
        report.is_resolved = True
        report.save()

    return redirect('dashboard')


# ---------------------------
# COURSE COMPLETION
# ---------------------------
@login_required
def add_course(request):
    if request.method == 'POST':
        course_name = request.POST.get('course_name')
        minimum_hours_required = request.POST.get('minimum_hours_required')
        approved_hours = request.POST.get('approved_hours')

        CourseCompletion.objects.create(
            student=request.user,
            course_name=course_name,
            minimum_hours_required=minimum_hours_required,
            approved_hours=approved_hours,
            is_completed=int(approved_hours) >= int(minimum_hours_required)
        )

        return redirect('dashboard')

    return render(request, 'add_course.html')
