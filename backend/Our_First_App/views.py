from django.shortcuts import render
from rest_framework import viewset
from .models import InternshipPlacement
from .serializers import InternshipPlacementSerializer

class InternshipPlacementPlacementViewSet(viewsets.ModelViewSet):
    queryset = InternshipPlacement.objects.all()
    serializer_class = InternshipPlacementSerializer

# Create your views here.
