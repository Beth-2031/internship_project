from datetime import date, timedelta
import os
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, serializers, status
from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout
import csv
from Our_First_App.models import (
    CustomUser,
    InternshipPlacement,
    WeeklyLog,
    SafetyReport,
    CourseCompletion,
)


def _normalize_user_type(user_type):
    return 'internship_admin' if user_type == 'admin' else user_type


def _is_admin_user(user):
    return (
        _normalize_user_type(getattr(user, 'user_type', '')) == 'internship_admin'
        or getattr(user, 'is_staff', False)
        or getattr(user, 'is_superuser', False)
    )


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    username = serializers.CharField(required=False)
    assigned_students = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'user_type', 'skills', 'course', 'department', 'password', 'assigned_students']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        assigned_students = validated_data.pop('assigned_students', [])
        role = validated_data.get('user_type', '')
        role_map = {
            'student': 'student',
            'workplace': 'workplace_supervisor',
            'academic': 'academic_supervisor',
            'admin': 'internship_admin',
            'workplace_supervisor': 'workplace_supervisor',
            'academic_supervisor': 'academic_supervisor',
            'internship_admin': 'internship_admin',
        }
        validated_data['user_type'] = role_map.get(role, role)
        email = validated_data.get('email', '')
        if not validated_data.get('username'):
            validated_data['username'] = email
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        user.save()

        # Link assigned students to this new supervisor
        if assigned_students and user.user_type in ('workplace_supervisor', 'academic_supervisor'):
            supervisor_field = 'workplace_supervisor' if user.user_type == 'workplace_supervisor' else 'academic_supervisor'
            for student_id in assigned_students:
                try:
                    student = CustomUser.objects.get(id=student_id, user_type='student')
                    placement = InternshipPlacement.objects.filter(student=student).order_by('-id').first()
                    if placement:
                        setattr(placement, supervisor_field, user)
                        placement.save()
                    else:
                        InternshipPlacement.objects.create(
                            student=student,
                            **{supervisor_field: user},
                            company_name='TBD',
                            location='TBD',
                            department='TBD',
                            start_date=date.today(),
                            end_date=date.today() + timedelta(days=180)
                        )
                except CustomUser.DoesNotExist:
                    continue

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not _is_admin_user(user):
            return CustomUser.objects.none()
        qs = CustomUser.objects.all().order_by('id')
        user_type = self.request.query_params.get('type')
        if user_type:
            role_map = {
                'student': 'student',
                'workplace': 'workplace_supervisor',
                'academic': 'academic_supervisor',
                'admin': 'internship_admin',
                'workplace_supervisor': 'workplace_supervisor',
                'academic_supervisor': 'academic_supervisor',
                'internship_admin': 'internship_admin',
            }
            mapped = role_map.get(user_type, user_type)
            qs = qs.filter(user_type=mapped)
        return qs

    def create(self, request, *args, **kwargs):
        if not _is_admin_user(request.user):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        if not request.data.get('email', '').strip():
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not request.data.get('password', ''):
            return Response({'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            return super().create(request, *args, **kwargs)
        except Exception:
            return Response(
                {'error': 'Username or email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
             


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user = CustomUser.objects.get(username=email)
        if user.check_password(password):
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': _normalize_user_type(user.user_type),
                }
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=400)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Invalid credential'}, status=400)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def register_view(request):
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    role = request.data.get('role', 'student')
    full_name = request.data.get('full_name', '')
    course = request.data.get('course', '')
    department = request.data.get('department', '')

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    role_map = {
        'student': 'student',
        'workplace': 'workplace_supervisor',
        'academic': 'academic_supervisor',
        'admin': 'internship_admin',
        'workplace_supervisor': 'workplace_supervisor',
        'academic_supervisor': 'academic_supervisor',
        'internship_admin': 'internship_admin',
    }
    user_type = role_map.get(role, 'student')

    if user_type in ('workplace_supervisor', 'academic_supervisor'):
        return Response({'error': 'This role can only be created by an administrator.'}, status=status.HTTP_403_FORBIDDEN)

    if CustomUser.objects.filter(username=email).exists():
        return Response({'error': 'User already exists'}, status=400)

    # Split full name into first and last
    name_parts = full_name.strip().split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ''

    CustomUser.objects.create_user(
        username=email,
        email=email,
        password=password,
        user_type=user_type,
        first_name=first_name,
        last_name=last_name,
        course=course or None,
        department=department or None,
    )
    return Response({'message': 'Registration successful', 'user_type': user_type})


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def password_reset_request_view(request):
    """
    Request a password reset link.
    Always returns 200 to avoid leaking whether an email exists.
    """
    email = (request.data.get('email') or '').strip()
    # Default response (do not reveal whether the user exists).
    ok_response = Response({'message': 'If an account exists for this email, a reset link has been sent.'})

    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.filter(email__iexact=email).order_by('-id').first()
    if not user:
        return ok_response

    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    reset_link = f"{frontend_url}/reset-password?uid={uidb64}&token={token}"

    subject = "Password reset - Internship Management System"
    body = (
        "You requested to reset your password.\n\n"
        f"Reset your password using this link:\n{reset_link}\n\n"
        "If you did not request a password reset, you can ignore this email."
    )

    from_email = os.environ.get('DEFAULT_FROM_EMAIL') or os.environ.get('EMAIL_HOST_USER') or None

    try:
        send_mail(subject, body, from_email, [user.email], fail_silently=False)
    except Exception:
        # Don't crash the API if email delivery is not configured.
        return ok_response

    return ok_response


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def password_reset_confirm_view(request):
    """
    Confirm password reset using uid+token and set new password.
    """
    uidb64 = (request.data.get('uid') or '').strip()
    token = (request.data.get('token') or '').strip()
    new_password = request.data.get('new_password') or ''

    if not uidb64 or not token or not new_password:
        return Response(
            {'error': 'uid, token and new_password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(new_password) < 6:
        return Response({'error': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = CustomUser.objects.get(pk=uid)
    except Exception:
        return Response({'error': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password has been reset successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'user_type': _normalize_user_type(user.user_type),
        'course': user.course,
        'department': user.department,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out'})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def users_view(request):
    if not _is_admin_user(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        role_map = {
            'student': 'student',
            'workplace': 'workplace_supervisor',
            'academic': 'academic_supervisor',
            'admin': 'internship_admin',
            'workplace_supervisor': 'workplace_supervisor',
            'academic_supervisor': 'academic_supervisor',
            'internship_admin': 'internship_admin',
        }
        requested_type = request.query_params.get('type')
        queryset = CustomUser.objects.all().order_by('id')
        if requested_type:
            queryset = queryset.filter(user_type=role_map.get(requested_type, requested_type))
        data = UserSerializer(queryset, many=True).data
        return Response(data)

    payload = dict(request.data)
    payload['user_type'] = {
        'student': 'student',
        'workplace': 'workplace_supervisor',
        'academic': 'academic_supervisor',
        'admin': 'internship_admin',
        'workplace_supervisor': 'workplace_supervisor',
        'academic_supervisor': 'academic_supervisor',
        'internship_admin': 'internship_admin',
    }.get(payload.get('user_type'), payload.get('user_type'))
    payload.setdefault('username', payload.get('email'))

    serializer = UserSerializer(data=payload)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': 'Username or email already exists.'},
            status=status.HTTP_400_BAD_REQUEST
            )
        


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats_view(request):
    if not _is_admin_user(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    return Response({
        'total_placements': InternshipPlacement.objects.count(),
        'pending_placements': InternshipPlacement.objects.filter(is_approved=False).count(),
        'safety_reports': SafetyReport.objects.count(),
        'open_safety': SafetyReport.objects.filter(is_resolved=False).count(),
        'completed': CourseCompletion.objects.filter(is_completed=True).count(),
        'students': CustomUser.objects.filter(user_type='student').count(),
        'supervisors': CustomUser.objects.filter(user_type='workplace_supervisor').count(),
    })


def _write_csv_response(filename, headers, rows):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    writer = csv.writer(response)
    writer.writerow(headers)
    for row in rows:
        writer.writerow(row)
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_view(request):
    if not _is_admin_user(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    export_type = request.query_params.get('type', '').strip().lower()

    if export_type == 'placements':
        rows = InternshipPlacement.objects.select_related('student', 'workplace_supervisor', 'academic_supervisor').all()
        return _write_csv_response(
            'placements.csv',
            ['id', 'student', 'company_name', 'department', 'location', 'start_date', 'end_date', 'is_approved', 'workplace_supervisor', 'academic_supervisor'],
            [
                [
                    p.id,
                    p.student.username if p.student else '',
                    p.company_name,
                    p.department,
                    p.location,
                    p.start_date,
                    p.end_date,
                    p.is_approved,
                    p.workplace_supervisor.username if p.workplace_supervisor else '',
                    p.academic_supervisor.username if p.academic_supervisor else '',
                ]
                for p in rows
            ],
        )

    if export_type == 'logs':
        rows = WeeklyLog.objects.select_related('student', 'placement').all()
        return _write_csv_response(
            'logs.csv',
            ['id', 'student', 'placement_id', 'week_number', 'hours_worked', 'is_verified', 'date_submitted'],
            [[l.id, l.student.username if l.student else '', l.placement_id, l.week_number, l.hours_worked, l.is_verified, l.date_submitted] for l in rows],
        )

    if export_type == 'safety':
        rows = SafetyReport.objects.select_related('student').all()
        return _write_csv_response(
            'safety.csv',
            ['id', 'student', 'description', 'date_reported', 'is_resolved'],
            [[r.id, r.student.username if r.student else '', r.description, r.date_reported, r.is_resolved] for r in rows],
        )

    if export_type == 'users':
        rows = CustomUser.objects.all()
        return _write_csv_response(
            'users.csv',
            ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'skills'],
            [[u.id, u.username, u.email, u.first_name, u.last_name, u.user_type, u.skills] for u in rows],
        )

    if export_type == 'courses':
        rows = CourseCompletion.objects.select_related('student').all()
        return _write_csv_response(
            'courses.csv',
            ['id', 'student', 'course_name', 'minimum_hours_required', 'approved_hours', 'is_completed'],
            [[c.id, c.student.username if c.student else '', c.course_name, c.minimum_hours_required, c.approved_hours, c.is_completed] for c in rows],
        )

    return Response({'error': 'Invalid export type'}, status=status.HTTP_400_BAD_REQUEST)