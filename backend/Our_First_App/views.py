from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, permissions, status, filters

from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    CustomUser,
    InternshipPlacement,
    WeeklyLog,
    SafetyReport,
    CourseCompletion, 
    SupervisorReview,
    Evaluation,
    Notification
)
from .serializers import (
    InternshipPlacementSerializer,
    WeeklyLogSerializer,
    SafetyReportSerializer,
    CourseCompletionSerializer,
    NotificationSerializer,
    SupervisorReviewSerializer,
    EvaluationSerializer,
)


from django_filters.rest_framework import DjangoFilterBackend
from .signals import create_notification

class InternshipPlacementViewSet(viewsets.ModelViewSet):
    serializer_class = InternshipPlacementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['is_approved', 'student', 'workplace_supervisor', 'academic_supervisor']
    ordering_fields = ['start_date', 'end_date', 'company_name']
    search_fields = ['company_name', 'location', 'department']

    def perform_create(self, serializer):
        if 'student' not in serializer.validated_data:
            serializer.save(student=self.request.user)
        else:
            serializer.save()

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
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


class WeeklyLogViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklyLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'is_verified', 'week_number', 'student']
    ordering_fields = ['week_number', 'date_submitted']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
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

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.is_verified and request.user == instance.student:
            return Response(
                {"error": "This log has been verified and cannot be edited."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if "is_verified" in request.data:
            is_assigned = (
                request.user == instance.placement.workplace_supervisor or
                request.user == instance.placement.academic_supervisor or
                request.user.user_type == 'internship_admin'
            )
            if not is_assigned:
                return Response(
                    {"error": "You are not the assigned supervisor for this log."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            
            # Handle verification with feedback
            if request.data.get('is_verified') is True:
                comments = request.data.get('comments', '')
                review, created = SupervisorReview.objects.get_or_create(log=instance)
                review.approve(supervisor=request.user, comments=comments)
                # Note: review.approve() calls instance.save() via log.save()
                return Response({"message": "Log verified with feedback.", "feedback": comments})

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @action(detail=False, methods=["get"], url_path="progress")
    def progress(self, request):
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
    
class SupervisorReviewViewSet(viewsets.ModelViewSet):
    serializer_class = SupervisorReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'workplace_supervisor':
            # Show reviews where they are the assigned supervisor on the placement
            return SupervisorReview.objects.filter(
                models.Q(supervisor=user) | 
                models.Q(log__placement__workplace_supervisor=user)
            ).distinct()
        if user.user_type == 'academic_supervisor':
            # Show reviews where they are the assigned supervisor on the placement
            return SupervisorReview.objects.filter(
                models.Q(supervisor=user) | 
                models.Q(log__placement__academic_supervisor=user)
            ).distinct()
        if user.user_type == 'internship_admin':
            return SupervisorReview.objects.all()
        if user.user_type == 'student':
            return SupervisorReview.objects.filter(log__student=user)
        return SupervisorReview.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(supervisor=self.request.user)

class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return Evaluation.objects.filter(placement__student=user)
        if user.user_type == 'workplace_supervisor':
            return Evaluation.objects.filter(
                placement__workplace_supervisor=user
            )
        if user.user_type == 'academic_supervisor':
            return Evaluation.objects.filter(
                placement__academic_supervisor=user
            )
        if user.user_type == 'internship_admin':
            return Evaluation.objects.all()
        return Evaluation.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.user_type not in [
            'workplace_supervisor',
            'academic_supervisor',
            'internship_admin'
        ]:
            raise permissions.PermissionDenied(
                "Only supervisors can create evaluations." 
            )
        serializer.save()    


class SafetyReportViewSet(viewsets.ModelViewSet):
    serializer_class = SafetyReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_resolved', 'student']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return SafetyReport.objects.none()
        if user.user_type == 'student':
            return SafetyReport.objects.filter(student=user)
        if user.user_type == 'workplace_supervisor':
            return SafetyReport.objects.filter(student__placements__workplace_supervisor=user).distinct()
        if user.user_type == 'academic_supervisor':
            return SafetyReport.objects.filter(student__placements__academic_supervisor=user).distinct()
        if user.user_type == 'internship_admin':
            return SafetyReport.objects.all()
        return SafetyReport.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type != 'student':
            raise permissions.PermissionDenied("Only students can submit safety reports.")
        serializer.save(student=user)


class CourseCompletionViewSet(viewsets.ModelViewSet):
    serializer_class = CourseCompletionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_completed', 'student']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return CourseCompletion.objects.none()
        if user.user_type == 'student':
            return CourseCompletion.objects.filter(student=user)
        if user.user_type == 'workplace_supervisor':
            return CourseCompletion.objects.filter(student__placements__workplace_supervisor=user).distinct()
        if user.user_type == 'academic_supervisor':
            return CourseCompletion.objects.filter(student__placements__academic_supervisor=user).distinct()
        if user.user_type == 'internship_admin':
            return CourseCompletion.objects.all()
        return CourseCompletion.objects.none()


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def partial_update(self, request, *args, **kwargs):
        """Allow marking a notification as read via PATCH."""
        notification = self.get_object()
        if notification.user != request.user:
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        notification.is_read = request.data.get('is_read', True)
        notification.save()
        return JsonResponse({'message': 'Notification updated'})
# =========================
# SIMPLE DASHBOARDS
# =========================
@login_required
def redirect_user(request):
    return JsonResponse({'message': 'redirect'})


@login_required
def student_dashboard(request):
    user = request.user
    logs = WeeklyLog.objects.filter(student =user)
    placements = InternshipPlacement.objects.filter(student=user)
    return JsonResponse({
        'total_placements': placements.count(),
        'total_logs': logs.count(),
        'verified_logs': logs.filter(is_verified=True).count(),
        'pending_logs': logs.filter(is_verified=False).count(),
        'submitted_logs': logs.filter(status='submitted').count(),
        'draft_logs': logs.filter(status='draft').count()
        })


@login_required
def workplace_dashboard(request):
    user = request.user
    placements = InternshipPlacement.objects.filter(workplace_supervisor=user)
    
    # Optimized with select_related
    pending_reviews = SupervisorReview.objects.filter(
        log__placement__workplace_supervisor=user,
        status='pending'
    ).select_related('log', 'log__student').distinct()
    
    approved_reviews = SupervisorReview.objects.filter(
        supervisor=user,
        status='approved'
    ).select_related('log', 'log__student')
    
    return JsonResponse({
        'total_placements': placements.count(),
        'pending_reviews': pending_reviews.count(),
        'approved_reviews': approved_reviews.count(),
        'total_reviews': pending_reviews.count() + approved_reviews.count(),
        })


@login_required
def academic_dashboard(request):
    user = request.user
    placements = InternshipPlacement.objects.filter(academic_supervisor=user)
    
    # Optimized with select_related
    pending_reviews = SupervisorReview.objects.filter(
        log__placement__academic_supervisor=user,
        status='pending'
    ).select_related('log', 'log__student').distinct()
    
    logs = WeeklyLog.objects.filter(
        placement__academic_supervisor=user
    ).select_related('student', 'placement')
    
    return JsonResponse({
        'total_placements': placements.count(),
        'total_logs': logs.count(),
        'verified_logs': logs.filter(is_verified=True).count(),
        'pending_logs': logs.filter(is_verified=False).count(),
        'pending_reviews': pending_reviews.count(),
    })


@login_required
def admin_dashboard(request):
    from django.db.models import Count, Avg
    eval_stats = Evaluation.objects.filter(is_submitted=True).aggregate(avg_score=Avg('total_score'))
    
    return JsonResponse({
        'total_students': CustomUser.objects.filter(
            user_type='student'
        ).count(),
        'total_placements': InternshipPlacement.objects.count(),
        'approved_placements': InternshipPlacement.objects.filter(
            is_approved=True
        ).count(),
        'pending_placements': InternshipPlacement.objects.filter(
            is_approved=False
        ).count(),
        'total_logs': WeeklyLog.objects.count(),
        'verified_logs': WeeklyLog.objects.filter(
            is_verified=True
        ).count(),
        'pending_review': SupervisorReview.objects.filter(
            status='pending'
        ).count(),
        'total_safety_reports': SafetyReport.objects.count(),
        'unresolved_reports': SafetyReport.objects.filter(
            is_resolved=False
        ).count(),
        'average_score': round(eval_stats['avg_score'] or 0, 2),
    })
   


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
        # Use serializer to ensure data integrity and validation (e.g. overlaps)
        serializer = InternshipPlacementSerializer(data={
            'student': request.user.id,
            'company_name': request.POST.get('company_name'),
            'location': request.POST.get('location'),
            'department': request.POST.get('department'),
            'start_date': request.POST.get('start_date'),
            'end_date': request.POST.get('end_date')
        })
        if serializer.is_valid():
            serializer.save()
            return redirect('dashboard')
        else:
            # For simple feedback in legacy view
            errors = serializer.errors
            return render(request, 'create_placement.html', {'errors': errors})

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
        # Use serializer to ensure deadline enforcement and placement mapping
        serializer = WeeklyLogSerializer(data={
            'student': request.user.id,
            'placement': placement.id,
            'week_number': request.POST.get('week_number'),
            'tasks_done': request.POST.get('tasks_done'),
            'hours_worked': request.POST.get('hours_worked'),
            'challenges_faced': request.POST.get('challenges_faced'),
            'next_week_plans': request.POST.get('next_week_plans'),
            'status': 'submitted' # Legacy views usually submit immediately
        })
        if serializer.is_valid():
            serializer.save()
            return redirect('dashboard')
        else:
            return render(request, 'create_weekly_log.html', {
                'placement': placement,
                'errors': serializer.errors
            })

    return render(request, 'create_weekly_log.html', {'placement': placement})


@login_required
def verify_log(request, log_id):
    log = get_object_or_404(WeeklyLog, id=log_id)
    user = request.user

    # Only the assigned workplace or academic supervisor (or admin) can verify
    is_assigned_supervisor = (
        user == log.placement.workplace_supervisor or 
        user == log.placement.academic_supervisor or
        user.user_type == 'internship_admin'
    )

    if is_assigned_supervisor:
        comments = request.POST.get('comments', '') or request.GET.get('comments', '')
        
        # Update the associated SupervisorReview
        review, created = SupervisorReview.objects.get_or_create(log=log)
        review.approve(supervisor=user, comments=comments)
        # Note: The notification is now handled by the SupervisorReview signal
    else:
        return JsonResponse({'error': 'You are not the assigned supervisor for this student.'}, status=403)

    return redirect('dashboard')

@login_required
def submit_log(request, log_id):
    log = get_object_or_404(WeeklyLog, id=log_id)

    if log.student != request.user:
        return JsonResponse(
            {'error': 'This log is locked and cannot be submitted.'},
            status=403
        )
    log.status = 'submitted'
    log.save()
    return redirect('dashboard')

# =========================
# SAFETY MODULE
# =========================
@login_required
def report_safety_issue(request):
    if request.method == 'POST':
        # Use serializer for validation and integrity
        serializer = SafetyReportSerializer(data={
            'student': request.user.id,
            'description': request.POST.get('description')
        })
        if serializer.is_valid():
            serializer.save()
            return redirect('dashboard')
        else:
            return render(request, 'report_safety.html', {'errors': serializer.errors})

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
        # Use serializer for validation and integrity
        serializer = CourseCompletionSerializer(data={
            'student': request.user.id,
            'course_name': request.POST.get('course_name'),
            'minimum_hours_required': request.POST.get('minimum_hours_required'),
            'approved_hours': request.POST.get('approved_hours'),
        })
        if serializer.is_valid():
            serializer.save()
            return redirect('dashboard')
        else:
            return render(request, 'add_course.html', {'errors': serializer.errors})

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

@login_required
def submit_weekly_log(request):
    dashboard_map = {
        'student': 'student_dashboard',
        'workplace_supervisor': 'workplace_dashboard',
        'academic_supervisor': 'academic_dashboard',
        'internship_admin': 'admin_dashboard'
    }

    content = {
        "message": "Weekly log submitted successfully!",
        "return_url": dashboard_map.get(request.user.user_type, 'dashboard')
    }
    return render(request, 'success.html', content)