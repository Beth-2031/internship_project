from django.shortcuts import render
from rest_framework import viewsets
from .models import InternshipPlacement
from .serializers import InternshipPlacementSerializer

class InternshipPlacementViewSet(viewsets.ModelViewSet):
    queryset = InternshipPlacement.objects.all()
    serializer_class = InternshipPlacementSerializer
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

def redirect_user(request):
    return JsonResponse({'message': 'redirect'})

def student_dashboard(request):
    return JsonResponse({'message': 'student dashboard'})

def workplace_dashboard(request):
    return JsonResponse({'message': 'workplace dashboard'})

def academic_dashboard(request):
    return JsonResponse({'message': 'academic dashboard'})

def admin_dashboard(request):
    return JsonResponse({'message': 'admin dashboard'})



