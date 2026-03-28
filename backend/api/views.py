from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login

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