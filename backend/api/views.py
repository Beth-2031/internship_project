from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, serializers, status
from django.contrib.auth import authenticate, login, logout
from Our_First_App.models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'user_type', 'password']

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