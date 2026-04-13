from rest_framework import serializers
from .models import InternshipPlacement

class InternshipPlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipPlacement
        fields = '__all__'

def validate(self, data):
    student = data.get('student')
    start_date = data.get('start_date')
    end_date = data.get('end_date')

    overlapping = InternshipPlacement.objects.filter(
        student=student,
        start_date__lte=end_date,
        end_date__gte=start_date  
    )  

    if overlapping.exists():
        raise serializers.ValidationError(
            "This Student already has a placement that overlaps with these dates."
        )
    
    return data
