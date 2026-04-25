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
    

class WeeklyLogSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(user_type='student')
    )
    placement = serializers.PrimaryKeyRelatedField(
        queryset=InternshipPlacement.objects.all()
    )

    class Meta:
        model = WeeklyLog
        fields = '__all__'
        read_only_fields = ['date_submitted', 'student']

    def validate(self, data):
        student = data.get('student', getattr(self.instance, 'student', None))
        placement = data.get('placement', getattr(self.instance, 'placement', None))
        
        if student and placement and placement.student != student:
            raise serializers.ValidationError({
                "placement": "The selected student is not assigned to this placement."
            })
        return data


class SafetyReportSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(user_type='student')
    )

    class Meta:
        model = SafetyReport
        fields = '__all__'
        read_only_fields = ['date_reported', 'student']



class CourseCompletionSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(user_type='student')
    )

    class Meta:
        model = CourseCompletion
        fields = '__all__'
