# Techinical Documentation
## Internship Management System

## System Architecture
-Frontend: Reeact + Vite (runs on port 5173)
-Backend: Django REST Framework (runs on port 8000)
-Database: SQLite (development)

## User Roles
-Student - submits weekly logs and safety reports
-Workplace Supervisor - reviews and appoves student logs
-Academic Supervisor - monitors student academic progress
-Intership Admin - manages all users and placements

## Database Models
-CustomUser - stores all user accounts and roles
-InternshipPlacement - links students to companie and supervisors
-WeeklyLog - student weekly activity submisssions
-SupervisorReview - supervisor feedback on weekly logs
-Evaluation - stores weighted scores (40% + 30% + 30%)  
-SafetyReport - student safety incident reports
-CourseCompletion - tracks course hours completion
-Notification - system notifications for users

## API Endpoints
-/api/placements/ - manage internship placements
-/api/weekly-logs/ - submit and review weekly logs
-/api/supervisor-reviews/ - supervisor review workflow
-/api/evaluations/ - score computation and storage
-/api/safety-reports/ - safety incident management
-/api/notifications/ - user notifications
-/api/users/ - user management

## Score Computation
Total score = (Supervisor Score x 40%) + (Logbook Score  x 30%) + (Academic Score x 30%)

## Authentication 
-Session based authentication using Django
-Login required for all endpoints
-Role based access control on all views
