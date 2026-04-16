from rest_framework import serializers
from .models import InternshipPlacement, CustomUser, WeeklyLog, SafetyReport, CourseCompletion

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type','skills']


class InternshipPlacementSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(user_type='student'))
    workplace_supervisor = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.filter(
        user_type='workplace_supervisor'), 
        required=False,
        allow_null=True)        
    academic_supervisor = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(user_type='academic_supervisor'),
        required=False,
        allow_null=True)
    
    class Meta:
        model = InternshipPlacement
        fields = '__all__'


    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError({
                    "end_date": "End date must be after start date."
                })
        return data   