from rest_framework import serializers
from .models import InternshipPlacement

class InternshipPlacementSerializer(serializers.ModelSerial):
    class Meta:
        model = InternshipPlacement
        field = '__all__'