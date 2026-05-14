from rest_framework import serializers
from .models import InternshipPlacement, CustomUser, WeeklyLog, SafetyReport, CourseCompletion, Notification, SupervisorReview, Evaluation

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type','skills' , 'department', 'student_number']

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value


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
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        student = data.get('student') or (self.instance.student if self.instance else None)

        if start_date and end_date:
            if start_date >= end_date:
                raise serializers.ValidationError({
                    "end_date": "End date must be after start date."
                })
            

            if student:
                overlapping = InternshipPlacement.objects.filter(
                    student=student,
                    start_date__lt=end_date,
                    end_date__gt=start_date
                )
                
                
                if self.instance:
                    overlapping = overlapping.exclude(pk=self.instance.pk)
                
                if overlapping.exists():
                    raise serializers.ValidationError({
                        "non_field_errors": "This student already has an overlapping placement for the selected dates."
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
    
    
    feedback = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyLog
        fields = '__all__'
        read_only_fields = ['date_submitted']

    def get_feedback(self, obj):
        try:
            return obj.review.comments
        except:
            return None

    def validate(self, data):
        student = data.get('student', getattr(self.instance, 'student', None))
        placement = data.get('placement', getattr(self.instance, 'placement', None))
        status_val = data.get('status', getattr(self.instance, 'status', None))
        
        
        if student and placement and placement.student != student:
            raise serializers.ValidationError({
                "placement": "The selected student is not assigned to this placement."
            })


        if self.instance and self.instance.is_verified:
            
            if any(key in data for key in ['tasks_done', 'hours_worked', 'challenges_faced', 'next_week_plans', 'week_number']):
                raise serializers.ValidationError("Cannot edit a log that has already been verified.")

        
        if status_val == 'submitted':
            deadline = getattr(self.instance, 'submission_deadline', None)
            if deadline and timezone.now().date() > deadline:
                raise serializers.ValidationError({
                    "non_field_errors": "Submission failed. The deadline for this weekly log has passed."
                })
            
            
            if placement and data.get('week_number'):
                days_since_start = (timezone.now().date() - placement.start_date).days
                current_week = (days_since_start // 7) + 1
                
                if data['week_number'] > current_week:
                    raise serializers.ValidationError({
                        "week_number": f"You cannot submit a log for Week {data['week_number']} yet. You are currently in Week {current_week} of your internship."
                    })
                
        return data
    
class SupervisorReviewSerializer(serializers.ModelSerializer):
    supervisor = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(
            user_type__in=['workplace_supervisor', 'academic_supervisor']
        ),
        required=False,
        allow_null=True
    )

    class Meta:
        model = SupervisorReview
        fields = '__all__'
        read_only_fields = ['reviewed_at']

class EvaluationSerializer(serializers.ModelSerializer):
    placement = serializers.PrimaryKeyRelatedField(
        queryset=InternshipPlacement.objects.all()
    )
    class Meta:
        model = Evaluation
        fields = '__all__'
        read_only_fields = ['total_score', 'submitted_at']

    def validate(self, data):
        if self.instance and self.instance.is_submitted:
            raise serializers.ValidationError(
                'This evaluation has already been submitted and cannot be edited.'
            )
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
    

