from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
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


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'user_type', 'skills', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
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
        validated_data.setdefault('username', email)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        user.save()
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
        if user.user_type not in ('internship_admin',):
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
        if request.user.user_type != 'internship_admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
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
                    'user_type': user.user_type,
                }
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=400)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Invalid credential'}, status=400)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role')

    role_map = {
        'student': 'student',
        'workplace': 'workplace_supervisor',
        'academic': 'academic_supervisor',
        'admin': 'internship_admin',
        'workplace_supervisor': 'workplace_supervisor',
        'academic_supervisor': 'academic_supervisor',
        'internship_admin': 'internship_admin',
    }
    user_type = role_map.get(role)
    if not user_type:
        return Response({'error': 'Invalid role'}, status=400)

    if CustomUser.objects.filter(username=email).exists():
        return Response({'error': 'User already exists'}, status=400)

    CustomUser.objects.create_user(
        username=email,
        email=email,
        password=password,
        user_type=user_type,
    )
    return Response({'message': 'Registration successful', 'user_type': user_type})


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
        'user_type': user.user_type,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out'})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def users_view(request):
    if request.user.user_type != 'internship_admin':
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
    user = serializer.save()
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats_view(request):
    if request.user.user_type != 'internship_admin':
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
    if request.user.user_type != 'internship_admin':
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