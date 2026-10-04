# AI-Powered Employee Management System (AI-EMS) 🚀

> **A modern, full-stack, enterprise-grade Employee Management System integrated with specialized Machine Learning & NLP microservices for intelligent HR operations.**
> Built as a B.Tech Final Year Capstone Project.

---

## 🌟 Key Highlights & Architectural Overview

AI-EMS combines a high-performance **Java Spring Boot** transactional core, a modern **React 19** responsive user interface, and a dedicated **Python Flask AI Microservice** executing 6 tailored machine learning & natural language processing algorithms.

```
                      +---------------------------------------+
                      |       React 19 Single Page App        |
                      |        (Vite + Tailwind/CSS)          |
                      |         http://localhost:5173         |
                      +-------------------+-------------------+
                                          |
                        +-----------------+-----------------+
                        | (JWT Auth REST)                   | (Direct / Proxy AI REST)
                        v                                   v
    +---------------------------------------+   +---------------------------------------+
    |       Java Spring Boot Backend        |   |       Python AI Microservice          |
    |      (Spring Boot 4.0.6, Java 17)     |   |         (Flask, Python 3.12)          |
    |         http://localhost:8080         |   |         http://localhost:5000         |
    +-------------------+-------------------+   +---------------------------------------+
                        |                                   |
                        v                                   |
    +---------------------------------------+               |
    |         MySQL 8.0 Database            |               |
    |   (Employees, Attendance, Payroll,   |               |
    |       Leaves, Departments, Users)     |               |
    +---------------------------------------+               |
                        ^                                   |
                        +-----------------------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Key Packages / Libraries |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, JavaScript (ES2024), CSS3 | `react-router-dom`, `axios`, `lucide-react` |
| **Backend** | Java 17, Spring Boot 4.0.6, Spring Data JPA | Spring Security, JJWT (HMAC-SHA256), Hibernate ORM |
| **Database** | MySQL 8.0 Community Server | MySQL Connector/J 9.2.0 |
| **AI Microservice** | Python 3.12, Flask, Flask-CORS | Scikit-Learn patterns, NLP Keyword Matrix, Regex Parser |
| **DevOps / Cloud** | Docker, Docker Compose, Vercel, Render | Multi-stage Docker builds, Nginx Alpine |

---

## 👥 Role-Based Access Control (RBAC)

The system enforces strict permission boundaries across 3 distinct tiers:

1. **ADMIN / HR**
   - Manage all employees (Create, Read, Update, Terminate).
   - Department administration and manager assignments.
   - Company-wide attendance marking, date filters, and percentage analytics.
   - Leave approval / rejection workflows with real-time balance tracking.
   - Comprehensive payroll generation with automated Net Salary formulas (`Basic + Allowances - Deductions`).
   - Executive reports with CSV export capabilities.
   - Full access to all 6 AI modules.

2. **MANAGER**
   - Department-level dashboard with team attendance insights.
   - Review and approve/reject team leave applications.
   - Team performance tracking and access to AI performance/attrition models.

3. **EMPLOYEE**
   - Personal self-service portal (profile, leave balance, attendance history).
   - Instant daily attendance check-in / check-out.
   - Leave request application with status tracking.
   - Monthly payslip view and downloadable salary slips.
   - AI HR policy chatbot access.

---

## 🧠 6 Specialized AI Microservices

The AI Microservice runs on port `5000` and features interactive intelligence pipelines:

1. **AI HR Chatbot (`/api/ai/chat`)**: Context-aware natural language assistant trained on EMS company policies (leaves, appraisals, attendance discipline, notice periods, welfare benefits).
2. **Resume Analyzer (`/api/ai/resume-analyzer`)**: Parses skills, years of experience, and degrees from candidate CVs; calculates ATS suitability match scores against target job roles.
3. **Employee Attrition Predictor (`/api/ai/attrition`)**: Multi-factor classification model calculating employee flight risk (Low/Medium/High) based on overtime hours, satisfaction metrics, and compensation.
4. **Performance Predictor (`/api/ai/performance`)**: Regression & evaluation engine projecting employee output, quarterly ratings, and recommended coaching trajectories.
5. **Salary Estimator (`/api/ai/salary`)**: Market-benchmarked compensation predictor calculating competitive salary bands based on experience, designation, and skills.
6. **AI Email Generator (`/api/ai/email-generator`)**: High-fidelity corporate template synthesizer generating tailored emails for offer letters, warnings, appreciation, and approvals.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Java JDK 17+**
- **Node.js 18+ & npm**
- **Python 3.10+**
- **MySQL Server 8.0** running on `localhost:3306`

### 1. Database Setup
Create the MySQL database (or let Spring Boot auto-create it):
```sql
CREATE DATABASE IF NOT EXISTS ems;
```
Configure your credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ems?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
```

### 2. Launch with One Click (Windows)
Double-click `start_all.bat` in the project root! It will launch all 3 microservices in separate terminal windows:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:8080](http://localhost:8080)
- **AI Microservice:** [http://localhost:5000](http://localhost:5000)

### 3. Launch Services Manually

#### A. Spring Boot Backend (Port 8080)
```bash
cd backend
mvnw.cmd clean package -DskipTests
java -jar target/EmployeeManagmentSystem1-0.0.1-SNAPSHOT.jar
```

#### B. Python AI Microservice (Port 5000)
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

#### C. React Frontend (Port 5173)
```bash
cd ems-frontend
npm install
npm run dev
```

---

## 🔑 Default Login Credentials

The system automatically initializes sample data with seeded credentials:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@ems.com` | `admin123` | Full enterprise control |
| **HR Specialist** | `hr@ems.com` | `hr123` | People operations, payroll, hiring |
| **Engineering Manager** | `manager@ems.com` | `manager123` | Team approvals, performance reviews |
| **Software Engineer** | `aarti.ghayde@example.com` | `employee123` | Self-service attendance & leaves |

---

## 🌐 How to Push to GitHub & Deploy Live

### Part 1: Push Project to GitHub

1. Open PowerShell or Terminal in the project root:
   ```bash
   cd "C:\Users\Roshan Verma\OneDrive\Desktop\EMS_Frontend"
   ```

2. Initialize Git and stage the files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Production AI-EMS Full Stack Application"
   ```

3. Create a new repository on [GitHub](https://github.com/new) named `AI-EMS`.

4. Link and push to your remote repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/AI-EMS.git
   git push -u origin main
   ```

---

### Part 2: Cloud Deployment Strategy (Why Vercel Alone Isn't Enough)

> **Important Architecture Note:**
> **Vercel** is the world leader for hosting **Frontend React/Vite SPAs** and Next.js applications on global CDNs. However, Vercel **cannot** run persistent background Java processes (Spring Boot) or persistent relational databases (MySQL).
>
> Therefore, the optimal free/hobby cloud deployment architecture is:
> - **Frontend:** [Vercel](https://vercel.com) (Instant 1-click deploy)
> - **Backend & MySQL:** [Railway](https://railway.app) or [Render](https://render.com)
> - **AI Microservice:** [Render](https://render.com)

---

### Step-by-Step Live Cloud Deployment Guide

#### 1. Deploy MySQL Database (Free on Railway / Aiven)
1. Go to [Railway.app](https://railway.app) or [Aiven.io](https://aiven.io).
2. Click **New Project** -> **Database** -> **Provision MySQL**.
3. Copy the MySQL Connection URL, Host, Username, and Password.

#### 2. Deploy Spring Boot Backend (on Render or Railway)
1. In [Render.com](https://render.com), click **New +** -> **Web Service**.
2. Connect your GitHub repository `AI-EMS`.
3. Set **Root Directory** to `backend`.
4. Select **Docker** (or Java 17).
5. Add Environment Variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<YOUR_CLOUD_MYSQL_HOST>:3306/ems`
   - `SPRING_DATASOURCE_USERNAME`: `<CLOUD_MYSQL_USER>`
   - `SPRING_DATASOURCE_PASSWORD`: `<CLOUD_MYSQL_PASSWORD>`
6. Deploy! Render will give you a live URL: `https://ai-ems-backend.onrender.com`.

#### 3. Deploy Python AI Microservice (on Render)
1. In [Render.com](https://render.com), click **New +** -> **Web Service**.
2. Connect your GitHub repository `AI-EMS`.
3. Set **Root Directory** to `ai-service`.
4. Set **Build Command**: `pip install -r requirements.txt`.
5. Set **Start Command**: `python app.py`.
6. Deploy! Render will give you a live URL: `https://ai-ems-ai.onrender.com`.

#### 4. Deploy React Frontend (on Vercel)
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository `AI-EMS`.
3. Set **Root Directory** to `ems-frontend`.
4. Framework Preset: **Vite**.
5. Add Environment Variables:
   - `VITE_BACKEND_URL`: `https://ai-ems-backend.onrender.com`
   - `VITE_AI_URL`: `https://ai-ems-ai.onrender.com`
6. Click **Deploy**! In 30 seconds, your site is live with HTTPS at `https://ai-ems.vercel.app`!

---

## 🐳 Docker Compose (1-Command Full Stack Run)

If you have Docker Desktop installed, you can spin up the entire cluster locally with zero configuration:

```bash
docker compose up -d --build
```

Services will be accessible at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- AI Microservice: `http://localhost:5000`
- MySQL: `localhost:3306`

---

## 📜 Academic Integrity & License
Developed as a B.Tech Final Year Engineering Project.
Released under the MIT License.
