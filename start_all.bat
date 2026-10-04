@echo off
echo ========================================================
echo   Starting AI-Powered Employee Management System (AI-EMS)
echo ========================================================
echo.

set SCRIPT_DIR=%~dp0

echo 1. Starting Spring Boot Backend (Port 8080)...
if exist "%SCRIPT_DIR%backend\target\EmployeeManagmentSystem1-0.0.1-SNAPSHOT.jar" (
    start "AI-EMS Backend (Port 8080)" cmd /k "cd /d "%SCRIPT_DIR%backend" && java -jar target\EmployeeManagmentSystem1-0.0.1-SNAPSHOT.jar"
) else (
    start "AI-EMS Backend (Port 8080)" cmd /k "cd /d "C:\Users\Roshan Verma\Documents\workspace-spring-tools-for-eclipse-5.0.1.RELEASE\EmployeeManagmentSystem1" && java -jar target\EmployeeManagmentSystem1-0.0.1-SNAPSHOT.jar"
)

echo 2. Starting Python AI Microservice (Port 5000)...
start "AI-EMS AI Service (Port 5000)" cmd /k "cd /d "%SCRIPT_DIR%ai-service" && python app.py"

echo 3. Starting React Vite Frontend (Port 5173)...
start "AI-EMS React Frontend (Port 5173)" cmd /k "cd /d "%SCRIPT_DIR%ems-frontend" && npm run dev"

echo.
echo ========================================================
echo All 3 services are launching in separate windows!
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:8080
echo - AI Service: http://localhost:5000
echo ========================================================
pause
