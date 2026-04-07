from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role')

    user = authenticate(request, username=email, password=password)

    if user is not None:
        login(request, user)
        return Response({'message': 'Login successful', 'role': role})
    else:
        return Response({'error': 'Invalid credentials'}, status=400) 

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role')

    if User.objects.filter(username=email).exists():
        return Response({'error': 'User already exists'}, status=400)

    user = User.objects.create_user(username=email, email=email, password=password)
    return Response({'message': 'Registration successful'})