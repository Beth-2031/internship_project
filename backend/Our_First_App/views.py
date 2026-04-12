from django.shortcuts import render
from rest_framework import viewsets
from .models import InternshipPlacement
from .serializers import InternshipPlacementSerializer

class InternshipPlacementViewSet(viewsets.ModelViewSet):
    queryset = InternshipPlacement.object.all()
    serializer_class = InternshipPlacementSerializer
    


