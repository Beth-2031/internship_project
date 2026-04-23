from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from Our_First_App.models import CustomUser

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(request, username=email, password=password)

    if user is not None:
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
