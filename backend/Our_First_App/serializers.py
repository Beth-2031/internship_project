from rest_framework import serializers
from .models import InternshipPlacement, CustomUser, WeeklyLog, SafetyReport, CourseCompletion, Notification

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type','skills']


class InternshipPlacementSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(user_type='student'),
        required=False,
        allow_null=True)
    workplace_supervisor = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(user_type='workplace_supervisor'),
        required=False,
        allow_null=True)
    academic_supervisor = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(user_type='academic_supervisor'),
        required=False,
        allow_null=True)

    student_name = serializers.SerializerMethodField()
    workplace_supervisor_name = serializers.SerializerMethodField()
    academic_supervisor_name = serializers.SerializerMethodField()

    class Meta:
        model = InternshipPlacement
        fields = '__all__'

    def get_student_name(self, obj):
        if obj.student:
            return obj.student.get_full_name() or obj.student.username
        return None

    def get_workplace_supervisor_name(self, obj):
        if obj.workplace_supervisor:
            return obj.workplace_supervisor.get_full_name() or obj.workplace_supervisor.username
        return None

    def get_academic_supervisor_name(self, obj):
        if obj.academic_supervisor:
            return obj.academic_supervisor.get_full_name() or obj.academic_supervisor.username
        return None

    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError({
                    "end_date": "End date must be after start date."
                })
        return data   
    

class WeeklyLogSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(user_type='student'),
        required=False,
        allow_null=True,
        default=serializers.CurrentUserDefault()
    )
    placement = serializers.PrimaryKeyRelatedField(
        queryset=InternshipPlacement.objects.all()
    )

    class Meta:
        model = WeeklyLog
        fields = '__all__'
        read_only_fields = ['date_submitted']

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
        queryset=CustomUser.objects.filter(user_type='student'),
        required=False,
        allow_null=True,
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = SafetyReport
        fields = '__all__'
        read_only_fields = ['date_reported']



class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_read', 'created_at']
        read_only_fields = ['created_at']


class CourseCompletionSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(user_type='student')
    )

    class Meta:
        model = CourseCompletion
        fields = '__all__'        
    def update(self, instance, validated_data):
        if instance.is_completed:
            raise serializers.ValidationError(
                'This course has been completed and cannot be edited.'
            )
        return super().update(instance, validated_data)
    

