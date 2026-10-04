# AI-Powered Employee Management System (AI-EMS)
## B.Tech Final-Year Project Presentation & Technical Guide

---

## 1. Project Overview & Architecture

**AI-EMS** is an enterprise-grade full-stack human resource management platform that digitizes organizational workflows while integrating predictive machine intelligence for modern HR operations.

```
                          ┌────────────────────────┐
                          │   React 19 + Vite UI   │
                          │ (Port 5173 / SaaS UI)  │
                          └────┬───────────────┬───┘
                               │               │
                     JWT Auth & REST     AI REST Calls
                               │               │
                               ▼               ▼
                   ┌───────────────────┐ ┌───────────────┐
                   │Spring Boot Backend│ │   Python AI   │
                   │    (Port 8080)    │ │ (Port 5000)   │
                   └─────────┬─────────┘ └───────────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │     MySQL 8.0     │
                   │ (Database: `ems`) │
                   └───────────────────┘
```

---

## 2. Quick Demo Credentials (For Viva / Presentation)

| Role | Email | Password | Primary Permissions |
|---|---|---|---|
| **Admin** | `admin@ems.com` | `admin123` | Full access to all modules, employee CRUD, departments, reports |
| **HR** | `hr@ems.com` | `hr123` | Employee onboarding, leave approvals, payroll, all AI features |
| **Manager** | `manager@ems.com` | `manager123` | Department team view, attendance, leave approval queue, performance AI |
| **Employee** | `aarti.ghayde@example.com` | `emp123` | Personal dashboard, daily check-in, apply leave, view payslips, HR Bot |

> *Note: On the login page, you can click on any of the quick-login chips to auto-fill these credentials instantly during your demonstration.*

---

## 3. Technology Stack & Implementation Highlights

### A. Frontend
- **Framework:** React 19 + Vite (Building in ~8s with ES modules)
- **Routing:** React Router v7 with role-based protected routes (`<ProtectedRoute allowedRoles={[...]}>`)
- **HTTP Client:** Centralized Axios instance with request/response interceptors for JWT token injection
- **Icons & UI:** Lucide React icons with a custom modern SaaS design system (Indigo/Slate palette, card hover elevations, status pills, responsive sidebar)

### B. Java Backend
- **Framework:** Spring Boot 4.0.6 on Java 17 LTS
- **Data Persistence:** Spring Data JPA with Hibernate ORM 7.x
- **Database:** MySQL 8.0 (Auto DDL update, relational tables for users, employees, departments, attendance, leaves, payroll)
- **Security & Tokens:** Pure Java HMAC-SHA256 JWT utility and salted SHA-256 password hashing

### C. AI Microservice
- **Framework:** Python Flask with CORS enabled on Port 5000
- **AI Modules:**
  1. **HR Assistant Chatbot:** Corporate policy knowledge base with interactive suggested inquiry chips.
  2. **Resume Analyzer:** Technical skills taxonomy extraction, education recognition, and candidate suitability scorecard (0–100%).
  3. **Attrition Risk Predictor:** Multi-factor retention analytics evaluating work-life balance, overtime burnout, tenure, and compensation.
  4. **Performance Prediction:** Analytical appraisal modeling combining attendance punctuality, project velocity, and peer reviews.
  5. **Salary Benchmark Predictor:** Market compensation calculation incorporating years of experience, verified skills, and job title.
  6. **AI Email Drafter:** Template and tone-configurable corporate communication generator with 1-click clipboard copy.

---

## 4. Key Formulas & Business Logic

### Payroll Net Salary Calculation:
$$\text{Net Salary} = \text{Basic Salary} + \text{Allowances (HRA/Special)} - \text{Deductions (PF/Tax)}$$

### Daily Attendance Rate Calculation:
$$\text{Attendance Rate (\%)} = \left(\frac{\text{Present Count} + \text{Late Count}}{\text{Total Headcount}}\right) \times 100$$

### Attrition Risk Estimation:
- Evaluates weighted penalties for overtime ($>20\text{ hrs/month}$), low satisfaction ($\le 2.5/5.0$), lack of promotion ($>2.5\text{ yrs}$), and below-benchmark compensation.

---

## 5. Live Service URLs

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Spring Boot Backend APIs:** [http://localhost:8080](http://localhost:8080)
- **Python AI Microservice:** [http://localhost:5000](http://localhost:5000)
- **1-Click Startup Script:** `C:\Users\Roshan Verma\OneDrive\Desktop\EMS_Frontend\start_all.bat`
