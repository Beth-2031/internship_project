# Internship Management System

A full-stack web Pplication for managing internships.

## Team Members
- Munanura Jill 25/U/05824/EVE
- Nabachwa Elizabeth 25/U/03489/EVE
- Atuhaire Bonitah 25/U/03343/EVE
- Migadde Thomas 25/U/03451/EVE

## Tech Stack
- Backend: Django, Django REST Framework
- Frontend: React, Vite, Recharts
- Database: SQLite

## Features
- Student weekly log submission
- Supervisor review and approval workflow
- Evaluation and score computation(40% + 30% + 30%)
- Role-based dashboards for students, supervisors and admin
- Safety report management
- Notification system

## User Roles
- Student - submits weekly logs and safety
- Workplace Supervisor - reviews and approves logs
- Academic Supervisor - monitors student progress
- Internship Admin - manage all users placements

## Setup Instructions

### Backend Setup
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

### Frontend Setup
cd Frontend
npm install
npm run start

## Running Tests

### Frontend Tests
cd frontend
npm test

### Backend Tests
cd backend
python manage.py test

## API Endpoints
- /api/placements/ - Intenship placements
- /api/weekly-log/ - Weekly logs
- /api/supervisor-reviews/ - Supervisor reviews
- /api/evaluations/ - Evaluations
- /api/safety-reports/ - Safety reports
- /api/notifications/ - Notifications

## Project Strcucture
internship_project/
    backend/
        Our_First_App/
            models.py
            views.py
            serializers.py
            urls.py
    frontend/
        src/
            pages/
            components/
            api/
            tests/
