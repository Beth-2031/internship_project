from django.contrib import admin
from .models import student,internshipAdmin,WorkplaceSupervisor,AcademicSupervisor

class StudentAdmin(admin.ModelAdmin):
    list_display = ("id","name","email")
    search_fields = ("name", "email")

class InternishipAdminAdmin(admin.ModelAdmin):
    list_display = ("id","name","email")
    search_fields = ("name", "email")

class WorkplaceSupervisorAdmin(admin.ModelAdmin):
    list_display = ("id","name","company","email")
    search_fields = ("name","company","email")

class AcademicSupervisorAdmin(admin.ModelAdmin):
    list_display = ("id","name","department","email")
    search_fields = ("name","department","email")

    admin.site.register(Student,StudentAdmin)
    admin.site.register(internshipAdmin,InternishipAdminAdmin)
    admin.site.register(WorkplaceSupervisor,WorkplaceSupervisorAdmin)
    admin.site.register(AcademicSupervisor,AcademicSupervisorAdmin)
    
