from django.apps import AppConfig


class InternshipConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Our_First_App'  

    def ready(self):
        import Our_First_App.signals
        print("app is ready")
