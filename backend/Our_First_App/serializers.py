from rest_framework import serializers
from .models import InternshipPlacement

<<<<<<< HEAD
class InternshipPlacementSerializer(serializers.ModelSerial):
    class Meta:
        model = InternshipPlacement
        field = '__all__'
=======
class InternshipPlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipPlacement
        fields = '__all__'
>>>>>>> Jill
