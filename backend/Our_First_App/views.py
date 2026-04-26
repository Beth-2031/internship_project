from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, permissions, status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import action
from rest_framework.response import Response
import json
from django.contrib.auth import authenticate, login


from .models import (
    CustomUser,
    InternshipPlacement,
    WeeklyLog,
    SafetyReport,
    CourseCompletion
)
from .serializers import InternshipPlacementSerializer, WeeklyLogSerializer, SafetyReportSerializer, CourseCompletionSerializer


from django_filters.rest_framework import DjangoFilterBackend

class InternshipPlacementViewSet(viewsets.ModelViewSet):
    queryset = InternshipPlacement.objects.all()
    serializer_class = InternshipPlacementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_approved', 'student', 'company_name']

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return InternshipPlacement.objects.none()
        if user.user_type == 'student':
            return InternshipPlacement.objects.filter(student=user)
        if user.user_type == 'workplace_supervisor':
            return InternshipPlacement.objects.filter(workplace_supervisor=user)
        if user.user_type == 'academic_supervisor':
            return InternshipPlacement.objects.filter(academic_supervisor=user)
        if user.user_type == 'internship_admin':
            return InternshipPlacement.objects.all()
        return InternshipPlacement.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type != 'student':
            raise permissions.PermissionDenied("Only students can request placements.")
        serializer.save(student=user, is_approved=False)

class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_verified', 'week_number', 'student']

    def get_queryset(self):
        user = getattr(self.request, "user", None)
        if not user or not user.is_authenticated:
            return WeeklyLog.objects.none()

        if user.user_type == 'student':
            return WeeklyLog.objects.filter(student=user)

        if user.user_type == 'workplace_supervisor':
            return WeeklyLog.objects.filter(placement__workplace_supervisor=user)

        if user.user_type == 'academic_supervisor':
            return WeeklyLog.objects.filter(placement__academic_supervisor=user)

        if user.user_type == 'internship_admin':
            return WeeklyLog.objects.all()

        return WeeklyLog.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type != 'student':
            raise permissions.PermissionDenied("Only students can submit weekly logs.")
        serializer.save(student=user)

    def update(self, request, ):
        instance = self.get_object()

        # Once verified, a student can't edit their log.
        if instance.is_verified and request.user == instance.student:
            return Response(
                {"error": "This log has been verified and cannot be edited."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Only supervisors/admin can set is_verified via the API.
        if "is_verified" in request.data:
            if request.user.user_type not in [
                "workplace_supervisor",
                "academic_supervisor",
                "internship_admin",
            ]:
                return Response(
                    {"error": "You are not allowed to verify weekly logs."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        # Reuse the same checks as update().
        return self.update(request, *args, **kwargs)

    @action(detail=False, methods=["get"], url_path="progress")
    def progress(self, request):
        """
        Lightweight progress summary for the current user's visible logs.
        """
        qs = self.filter_queryset(self.get_queryset())
        total = qs.count()
        verified = qs.filter(is_verified=True).count()
        pending = qs.filter(is_verified=False).count()
        weeks = list(qs.values_list("week_number", flat=True))
        return Response(
            {
                "total_logs": total,
                "verified_logs": verified,
                "pending_logs": pending,
                "weeks_submitted": sorted(set(weeks)),
            }
        )

class SafetyReportViewSet(viewsets.ModelViewSet):
    queryset = SafetyReport.objects.all()
    serializer_class = SafetyReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_resolved', 'student']  

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type != 'student':
            raise permissions.PermissionDenied("Only students can submit safety reports.")
        serializer.save(student=user)

class CourseCompletionViewSet(viewsets.ModelViewSet):
    queryset = CourseCompletion.objects.all()
    serializer_class = CourseCompletionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_completed', 'student']
# =========================
# SIMPLE DASHBOARDS 
# =========================
@login_required
def redirect_user(request):
    return JsonResponse({'message': 'redirect'})


@login_required
def student_dashboard(request):
    return JsonResponse({'message': 'student dashboard'})


@login_required
def workplace_dashboard(request):
    return JsonResponse({'message': 'workplace dashboard'})


@login_required
def academic_dashboard(request):
    return JsonResponse({'message': 'academic dashboard'})


@login_required
def admin_dashboard(request):
    return JsonResponse({'message': 'admin dashboard'})


# =========================
# MAIN DASHBOARD
# =========================
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


# =========================
# PLACEMENT MODULE
# =========================
@login_required
def create_placement(request):
    if request.method == 'POST':
        InternshipPlacement.objects.create(
            student=request.user,
            company_name=request.POST.get('company_name'),
            location=request.POST.get('location'),
            department=request.POST.get('department'),
            start_date=request.POST.get('start_date'),
            end_date=request.POST.get('end_date')
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


# =========================
# WEEKLY LOGS
# =========================
@login_required
def create_weekly_log(request, placement_id):
    placement = get_object_or_404(InternshipPlacement, id=placement_id)

    if request.method == 'POST':
        WeeklyLog.objects.create(
            student=request.user,
            placement=placement,
            week_number=request.POST.get('week_number'),
            tasks_done=request.POST.get('tasks_done'),
            hours_worked=request.POST.get('hours_worked'),
            challenges_faced=request.POST.get('challenges_faced'),
            next_week_plans=request.POST.get('next_week_plans')
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


# =========================
# SAFETY MODULE
# =========================
@login_required
def report_safety_issue(request):
    if request.method == 'POST':
        SafetyReport.objects.create(
            student=request.user,
            description=request.POST.get('description')
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


# =========================
# COURSE MODULE
# =========================
@login_required
def add_course(request):
    if request.method == 'POST':
        min_hours = int(request.POST.get('minimum_hours_required'))
        approved_hours = int(request.POST.get('approved_hours'))

        CourseCompletion.objects.create(
            student=request.user,
            course_name=request.POST.get('course_name'),
            minimum_hours_required=min_hours,
            approved_hours=approved_hours,
            is_completed=approved_hours >= min_hours
        )

        return redirect('dashboard')

    return render(request, 'add_course.html')

@login_required
def edit_weekly_log(request, log_id):
    log = get_object_or_404(WeeklyLog, id=log_id)

    if log.is_verified:
        return JsonResponse(
            {'error': 'This log has been verified and cannot be edited.'},
            status=403
        )
    
    if log.student != request.user:
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    if request.method == 'POST':
        log.tasks_done = request.POST.get('tasks_done')
        log.hours_worked = request.POST.get('hours_worked')
        log.challenges_faced = request.POST.get('challenges_faced')
        log.next_week_plans = request.POST.get('next_week_plans')
        log.save()
        return redirect('dashboard')
    
    return render (request, 'edit_week_log.html', {'log': log})

@login_required
def edit_placement(request, placement_id):
    placement = get_object_or_404(InternshipPlacement, id=placement_id)

    if placement.is_approved:
        return JsonResponse(
            {'error': 'This placement has been approved and cannot be edited'},
            status=403
        )
    if request.method == 'POST':
        placement.company_name = request.POST.get('company_name')
        placement.location = request.POST.get('location')
        placement.department = request.POST.get('department')
        placement.start_date = request.POST.get('start_date')
        placement.end_date = request.POST.get('end_date')
        placement.save()
        return redirect('dashboard')
    
    return render(request, 'edit_placement.html', {'placement': placement})

# =========================
# AUTH
# =========================
@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        try:
            user = CustomUser.objects.get(email=email)
            user = authenticate(request, username=user.username, password=password)
        except CustomUser.DoesNotExist:
            user = None

        if user:
            login(request, user)
            return JsonResponse({
                'message': 'Login successful',
                'user_type': user.user_type
            })

        return JsonResponse({'error': 'Invalid credentials'}, status=401)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

