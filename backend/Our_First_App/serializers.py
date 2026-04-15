from rest_framework import serializers
from .models import InternshipPlacement

class InternshipPlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipPlacement
        fields = '__all__'

    def update(self, instance, validated_data):
        if instance.is_approved:
            raise serializers.ValidationError(
                'This placement has been approved and cannot be edited.'
            )
        return super().update(instance, validated_data)
