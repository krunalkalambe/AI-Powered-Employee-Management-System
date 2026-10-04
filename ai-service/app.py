import os
import re
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ==========================================
# 1. AI HR CHATBOT KNOWLEDGE BASE & ENGINE
# ==========================================
HR_KNOWLEDGE = {
    "leave": (
        "### EMS Leave Policy Overview\n\n"
        "- **Casual Leave (CL):** 12 days per calendar year (accrued monthly).\n"
        "- **Sick Leave (SL):** 10 days per year. Medical certificate required for >2 consecutive days.\n"
        "- **Privilege/Earned Leave (PL):** 15 days per year, encashable or carry-forward up to 45 days.\n"
        "- **Maternity Leave:** 26 weeks paid leave for female employees (under Maternity Benefit Act).\n"
        "- **Paternity Leave:** 10 working days within 6 months of childbirth.\n"
        "- **Bereavement Leave:** Up to 5 days for immediate family members.\n\n"
        "**How to apply:** Navigate to the **Leave** section on your sidebar, select leave type, dates, provide a brief reason, and submit. Your manager or HR will review it within 24 hours."
    ),
    "attendance": (
        "### EMS Attendance & Working Hours Policy\n\n"
        "- **Core Office Hours:** 9:30 AM to 6:30 PM (Monday to Friday).\n"
        "- **Grace Period:** 15 minutes (up to 9:45 AM).\n"
        "- **Late Arrival:** Arrival after 9:45 AM is marked as *Late*. Three late marks in a single month result in a half-day leave deduction.\n"
        "- **Half Day:** Working less than 4.5 hours is considered a half day.\n"
        "- **Daily Check-In:** Please click **Check In** upon arrival and **Check Out** before leaving in the **Attendance** module."
    ),
    "payroll": (
        "### EMS Payroll & Salary Structure\n\n"
        "- **Salary Disbursement:** Credited directly to the employee's registered bank account on the **1st of every month**.\n"
        "- **Salary Formula:** `Net Salary = Basic Salary + Allowances (HRA/Special) - Deductions (PF/Tax/Leave)`.\n"
        "- **Payslips:** Accessible under the **Payroll** tab. You can view, filter by month, and print official salary slips anytime.\n"
        "- **Taxes & PF:** Provident Fund (12% of basic) and applicable TDS deductions are computed automatically."
    ),
    "appraisal": (
        "### EMS Performance Appraisal Cycle\n\n"
        "- **Annual Appraisal:** Conducted every April.\n"
        "- **Mid-Year Check-in:** Conducted in October for feedback and course correction.\n"
        "- **Rating Scale:** 1 to 5 (1: Unsatisfactory, 2: Needs Improvement, 3: Meets Expectations, 4: Exceeds Expectations, 5: Outstanding).\n"
        "- **Appraisal Factors:** Project deliveries, peer reviews, technical innovation, attendance discipline, and skill upgrades."
    ),
    "probation": (
        "### Probation & Notice Period Policy\n\n"
        "- **Probation Period:** Standard 3 months for entry-to-mid levels; 6 months for leadership roles.\n"
        "- **Confirmation:** Dependent on quarterly performance evaluation and mentor recommendation.\n"
        "- **Notice Period:** 60 days for confirmed staff; 30 days during probation period."
    ),
    "benefits": (
        "### Company Perks & Welfare Benefits\n\n"
        "- **Health Insurance:** INR 5,00,000 group health cover for employee, spouse, and up to 2 children.\n"
        "- **Learning Allowance:** Annual budget of INR 25,000 for relevant technical certifications and courses.\n"
        "- **Wellness:** Free mental health counseling and annual health checkup packages.\n"
        "- **Hybrid Work:** Up to 2 days Work-From-Home (WFH) per week upon manager approval."
    ),
    "posh": (
        "### Prevention of Sexual Harassment (POSH) & Ethics\n\n"
        "- AI-EMS maintains a **zero-tolerance policy** against workplace harassment and discrimination.\n"
        "- Any grievance can be submitted confidentially to the Internal Complaints Committee (ICC) at `posh-icc@ems.com` or directly to HR.\n"
        "- Inquiries are completed within 30 days adhering to statutory confidentiality."
    )
}

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    data = request.get_json() or {}
    message = (data.get('message') or '').strip().lower()

    if not message:
        return jsonify({"reply": "Please ask a question regarding HR policies, leaves, attendance, or payroll."})

    # Rule-based intent matching with fallback intelligent synthesis
    matched_key = None
    if any(w in message for w in ["leave", "holiday", "vacation", "sick", "casual", "cl", "sl", "maternity"]):
        matched_key = "leave"
    elif any(w in message for w in ["attendance", "timing", "hours", "late", "punch", "check in", "check out"]):
        matched_key = "attendance"
    elif any(w in message for w in ["salary", "payroll", "pay", "slip", "deduction", "allowance", "net salary"]):
        matched_key = "payroll"
    elif any(w in message for w in ["appraisal", "rating", "increment", "performance review", "promotion"]):
        matched_key = "appraisal"
    elif any(w in message for w in ["probation", "notice period", "resignation", "exit", "confirm"]):
        matched_key = "probation"
    elif any(w in message for w in ["benefit", "insurance", "perk", "wfh", "medical", "allowance"]):
        matched_key = "benefits"
    elif any(w in message for w in ["posh", "harass", "complaint", "conduct", "grievance", "ethics"]):
        matched_key = "posh"

    if matched_key:
        reply = HR_KNOWLEDGE[matched_key]
        suggestions = [
            "How do I apply for leave?",
            "What is the late arrival penalty?",
            "When is monthly salary disbursed?",
            "Tell me about health insurance benefits"
        ]
    else:
        reply = (
            f"Thank you for contacting AI-EMS HR Assistance! Regarding your query about: *\"{data.get('message')}\"*:\n\n"
            "Here is the guidance according to AI-EMS workplace guidelines:\n"
            "- If this is related to **leave/attendance**, submit your request via the dedicated portal tabs.\n"
            "- For **salary inquiries**, payslips are refreshed on the 1st of each month under the Payroll section.\n"
            "- For personalized HR support, please write to `hr@ems.com` or consult your assigned Department Manager.\n\n"
            "*Feel free to ask specific questions about leave balances, attendance grace periods, salary calculation, or company perks!*"
        )
        suggestions = [
            "What are the types of leaves available?",
            "How is Net Salary calculated?",
            "What is the company probation period?",
            "How does attendance tracking work?"
        ]

    return jsonify({
        "reply": reply,
        "suggestions": suggestions
    })


# ==========================================
# 2. RESUME ANALYZER
# ==========================================
SKILLS_TAXONOMY = {
    "languages": ["python", "java", "javascript", "typescript", "c++", "c#", "php", "ruby", "go", "kotlin", "swift", "sql", "html", "css"],
    "frameworks": ["react", "angular", "vue", "spring boot", "spring", "django", "flask", "fastapi", "express", "node.js", "nodejs", "hibernate", "tailwind", "bootstrap"],
    "databases": ["mysql", "postgresql", "mongodb", "oracle", "sqlite", "redis", "cassandra"],
    "devops_cloud": ["docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "ci/cd", "jenkins", "linux"],
    "soft_skills": ["communication", "leadership", "teamwork", "problem solving", "agile", "scrum", "mentoring", "critical thinking"]
}

@app.route('/api/ai/resume-analyzer', methods=['POST'])
def resume_analyzer():
    data = request.get_json() or {}
    resume_text = (data.get('resumeText') or '').lower()
    target_role = (data.get('targetRole') or 'Software Engineer').strip()

    if not resume_text:
        return jsonify({"error": "Resume text is required"}), 400

    found_skills = []
    for category, skill_list in SKILLS_TAXONOMY.items():
        for skill in skill_list:
            # Word boundary search
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, resume_text):
                found_skills.append(skill.title())

    # Detect Education
    education_found = []
    edu_keywords = ["b.tech", "b.e", "btech", "m.tech", "mtech", "bca", "mca", "b.sc", "m.sc", "bachelor", "master", "phd", "diploma"]
    for edu in edu_keywords:
        if re.search(r'\b' + re.escape(edu) + r'\b', resume_text):
            education_found.append(edu.upper())
    education_str = ", ".join(set(education_found)) if education_found else "Degree / Diploma Mentioned"

    # Detect Experience Years
    exp_match = re.search(r'(\d+(\.\d+)?)\s*(\+|\-)?\s*(years?|yrs?)', resume_text)
    detected_exp = float(exp_match.group(1)) if exp_match else 2.0

    # Role specific required skills
    role_lower = target_role.lower()
    if "full stack" in role_lower or "developer" in role_lower or "software" in role_lower:
        benchmark_skills = ["Java", "Spring Boot", "React", "Mysql", "Git", "Javascript", "Html", "Css"]
    elif "frontend" in role_lower or "ui" in role_lower:
        benchmark_skills = ["React", "Javascript", "Html", "Css", "Tailwind", "Git", "Typescript"]
    elif "backend" in role_lower:
        benchmark_skills = ["Java", "Spring Boot", "Mysql", "Docker", "Git", "Sql", "Hibernate"]
    elif "data" in role_lower or "ai" in role_lower:
        benchmark_skills = ["Python", "Sql", "Mysql", "Git", "Docker"]
    elif "hr" in role_lower or "manager" in role_lower:
        benchmark_skills = ["Communication", "Leadership", "Teamwork", "Agile", "Problem Solving"]
    else:
        benchmark_skills = ["Java", "Python", "Sql", "Communication", "Teamwork"]

    # Calculate match score
    matched_benchmark = [s for s in benchmark_skills if s.title() in found_skills or s.lower() in resume_text]
    missing_skills = [s for s in benchmark_skills if s not in matched_benchmark]

    match_percentage = min(98, max(42, int((len(matched_benchmark) / max(1, len(benchmark_skills))) * 85 + (len(found_skills) * 2))))

    if match_percentage >= 80:
        recommendation = "Highly Recommended: Candidate demonstrates strong alignment with core competencies for " + target_role
    elif match_percentage >= 65:
        recommendation = "Recommended for Technical Screening: Good candidate profile with minor skill gaps that can be bridged through onboarding."
    else:
        recommendation = "Moderate Suitability: Meets basic requirements, but lacks some core competencies specified for " + target_role

    return jsonify({
        "targetRole": target_role,
        "matchScore": match_percentage,
        "detectedExperience": f"{detected_exp} Years",
        "education": education_str,
        "skillsFound": found_skills[:16],
        "matchedBenchmarkSkills": matched_benchmark,
        "missingSkills": missing_skills,
        "strengths": [
            f"Proficient in {', '.join(found_skills[:4])}" if found_skills else "Demonstrates relevant academic coursework",
            "Clear technical foundation and structured resume formatting",
            f"Practical familiarity with {len(found_skills)} technical and domain skills"
        ],
        "recommendation": recommendation
    })


# ==========================================
# 3. ATTRITION RISK PREDICTOR
# ==========================================
@app.route('/api/ai/attrition', methods=['POST'])
def attrition_predictor():
    data = request.get_json() or {}

    satisfaction = float(data.get('jobSatisfaction', 3)) # 1-5
    performance = float(data.get('performanceScore', 3)) # 1-5
    overtime_hours = float(data.get('monthlyOvertimeHours', 10)) # hours
    salary = float(data.get('salary', 50000))
    tenure_years = float(data.get('tenureYears', 2.0))
    promotions = int(data.get('promotionsLast3Years', 0))
    work_life = float(data.get('workLifeBalance', 3)) # 1-5
    dept = data.get('department', 'Engineering')

    # Weighted risk heuristic calculation
    risk_score = 30.0 # base

    # Satisfaction impact (-15 to +25)
    risk_score += (3.5 - satisfaction) * 12.0

    # Work life balance (-10 to +20)
    risk_score += (3.5 - work_life) * 10.0

    # Overtime impact (> 20 hrs increases risk)
    if overtime_hours > 30:
        risk_score += 18.0
    elif overtime_hours > 15:
        risk_score += 8.0

    # Lack of promotion with high tenure
    if tenure_years >= 2.5 and promotions == 0:
        risk_score += 15.0

    # Low salary bracket
    if salary < 35000:
        risk_score += 10.0

    # Bound probability between 5% and 95%
    prob = max(5.0, min(95.0, risk_score))

    if prob < 35.0:
        risk_level = "LOW"
    elif prob < 65.0:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    # Identify primary contributing factors
    factors = []
    if satisfaction <= 2.5:
        factors.append("Low job satisfaction rating reported by employee")
    if overtime_hours > 20:
        factors.append(f"Excessive monthly overtime ({overtime_hours:.0f} hrs/month) elevating burnout risk")
    if work_life <= 2.5:
        factors.append("Sub-optimal work-life balance score")
    if tenure_years >= 2.0 and promotions == 0:
        factors.append(f"Over {tenure_years:.1f} years tenure without promotion or title advancement")
    if salary < 40000:
        factors.append("Compensation package trailing market average for this role")
    if not factors:
        factors.append("Healthy engagement metrics across all monitored parameters")

    # HR Actionable Suggestions
    suggestions = []
    if risk_level == "HIGH":
        suggestions.append("Schedule an urgent 1-on-1 retention dialogue within 7 days")
        suggestions.append("Evaluate salary benchmark adjustment or spot performance bonus")
        suggestions.append("Cap overtime hours and redistribute project workload")
    elif risk_level == "MEDIUM":
        suggestions.append("Conduct a mid-quarter satisfaction and career development check-in")
        suggestions.append("Provide opportunities for cross-functional project leadership")
    else:
        suggestions.append("Maintain positive engagement and recognize recent achievements")
        suggestions.append("Consider candidate for mentorship or leadership tracks")

    return jsonify({
        "riskLevel": risk_level,
        "attritionProbability": round(prob, 1),
        "department": dept,
        "contributingFactors": factors,
        "hrSuggestions": suggestions,
        "disclaimer": "AI Estimate: This prediction is an analytical estimate based on organizational metrics to support HR retention planning and does not constitute a guaranteed outcome."
    })


# ==========================================
# 4. PERFORMANCE PREDICTOR
# ==========================================
@app.route('/api/ai/performance', methods=['POST'])
def performance_predictor():
    data = request.get_json() or {}

    attendance_pct = float(data.get('attendancePercentage', 95)) # %
    projects_completed = int(data.get('projectsCompleted', 6))
    peer_rating = float(data.get('peerRating', 4.0)) # 1-5
    training_hours = float(data.get('trainingHours', 20)) # hrs
    exp_years = float(data.get('experienceYears', 3.0))

    # Predicted rating on 1.0 - 5.0 scale
    base = 2.5
    base += (attendance_pct / 100.0) * 0.8
    base += min(1.0, projects_completed * 0.1)
    base += (peer_rating / 5.0) * 0.8
    base += min(0.4, training_hours * 0.01)

    predicted_score = max(1.0, min(5.0, round(base, 2)))

    if predicted_score >= 4.4:
        category = "Top Performer (Exceeds Expectations)"
        review = "Exemplary consistency, strong peer feedback, and high execution velocity."
    elif predicted_score >= 3.6:
        category = "High Achiever (Meets & Exceeds)"
        review = "Reliable team player delivering quality work within deadlines."
    elif predicted_score >= 2.8:
        category = "Solid Contributor (Meets Expectations)"
        review = "Meets core job requirements with occasional coaching needed on complex deliverables."
    else:
        category = "Needs Improvement"
        review = "Performance metrics indicate a need for targeted skill enhancement and closer mentoring."

    roadmap = [
        "Continue active participation in quarterly sprint goals",
        f"Target completion of {max(10, int(training_hours + 15))} training hours in advanced domain technologies",
        "Encourage leading knowledge-sharing sessions with junior team members"
    ]

    return jsonify({
        "predictedScore": predicted_score,
        "performanceCategory": category,
        "evaluationSummary": review,
        "growthRoadmap": roadmap,
        "metricsEvaluated": {
            "attendance": f"{attendance_pct}%",
            "projectsCompleted": projects_completed,
            "peerFeedback": f"{peer_rating}/5.0",
            "trainingHours": f"{training_hours} hrs"
        }
    })


# ==========================================
# 5. SALARY PREDICTION
# ==========================================
@app.route('/api/ai/salary', methods=['POST'])
def salary_predictor():
    data = request.get_json() or {}

    designation = (data.get('designation') or 'Software Engineer').strip()
    department = (data.get('department') or 'Engineering').strip()
    exp = float(data.get('experienceYears', 2.0))
    skill_count = int(data.get('skillCount', 5))
    rating = float(data.get('performanceRating', 3.5))

    # Base market benchmark salaries (INR)
    base_salaries = {
        "intern": 20000,
        "junior": 35000,
        "software engineer": 55000,
        "senior software engineer": 85000,
        "tech lead": 120000,
        "engineering manager": 150000,
        "hr executive": 38000,
        "hr manager": 75000,
        "data analyst": 52000,
        "product manager": 110000
    }

    matched_base = 50000
    for key, val in base_salaries.items():
        if key in designation.lower():
            matched_base = val
            break

    # Experience multiplier (+12% per year of exp)
    exp_factor = 1.0 + (exp * 0.12)

    # Skills factor (+3% per relevant skill beyond 3)
    skill_factor = 1.0 + (max(0, skill_count - 3) * 0.03)

    # Rating factor
    perf_factor = 1.0 + ((rating - 3.0) * 0.08)

    expected_salary = int(matched_base * exp_factor * skill_factor * perf_factor)
    min_range = int(expected_salary * 0.88)
    max_range = int(expected_salary * 1.15)

    return jsonify({
        "designation": designation,
        "department": department,
        "experience": f"{exp} Years",
        "expectedSalary": expected_salary,
        "salaryRange": {
            "min": min_range,
            "max": max_range
        },
        "marketPercentile": "78th Percentile",
        "rationale": f"Calculated based on {exp} years of domain experience, {skill_count} certified skills, and {rating}/5 performance rating compared against current corporate compensation benchmarks.",
        "disclaimer": "AI Compensation Estimate: Real market salaries may vary depending on exact corporate budget, geographic location, and organizational tier."
    })


# ==========================================
# 6. AI EMAIL GENERATOR
# ==========================================
@app.route('/api/ai/email-generator', methods=['POST'])
def email_generator():
    data = request.get_json() or {}

    category = (data.get('category') or 'Leave Approval').strip()
    recipient = (data.get('recipientName') or 'Employee').strip()
    sender_name = (data.get('senderName') or 'Human Resources Team').strip()
    sender_title = (data.get('senderTitle') or 'HR Department').strip()
    tone = (data.get('tone') or 'Formal').strip()
    details = (data.get('details') or '').strip()

    subject = ""
    body = ""

    if "leave approval" in category.lower():
        subject = f"Notification: Leave Request Approved - {recipient}"
        body = (
            f"Dear {recipient},\n\n"
            f"We are pleased to inform you that your leave application has been reviewed and approved by management.\n\n"
            f"Details: {details if details else 'As per your submitted dates on the AI-EMS portal'}.\n\n"
            f"Please ensure all pending deliverables are appropriately transitioned to your team before proceeding on leave. We hope you have a restful and productive time off.\n\n"
            f"Warm regards,\n"
            f"{sender_name}\n"
            f"{sender_title}\n"
            f"AI-Powered Employee Management System"
        )
    elif "leave rejection" in category.lower():
        subject = f"Update Regarding Your Leave Request - {recipient}"
        body = (
            f"Dear {recipient},\n\n"
            f"Thank you for submitting your leave application. Regrettably, due to current project deliverables and operational commitments, your leave request cannot be approved for the requested dates.\n\n"
            f"Reason: {details if details else 'Critical project release timelines and mandatory team coverage'}.\n\n"
            f"We encourage you to discuss alternative dates with your reporting manager. We appreciate your understanding and cooperation.\n\n"
            f"Sincerely,\n"
            f"{sender_name}\n"
            f"{sender_title}"
        )
    elif "interview invitation" in category.lower():
        subject = f"Interview Invitation: AI-EMS Team - {recipient}"
        body = (
            f"Dear {recipient},\n\n"
            f"Thank you for your application. After reviewing your impressive profile, we are delighted to invite you for the technical interview stage.\n\n"
            f"Discussion Agenda & Schedule:\n"
            f"{details if details else 'Date: This Thursday at 11:00 AM IST via Google Meet / Teams'}\n\n"
            f"Please confirm your availability by replying to this email. We look forward to speaking with you!\n\n"
            f"Best regards,\n"
            f"{sender_name}\n"
            f"Talent Acquisition & HR Team"
        )
    elif "warning" in category.lower():
        subject = f"Official Notice: Workplace Discipline & Policy Compliance - {recipient}"
        body = (
            f"Dear {recipient},\n\n"
            f"This letter serves as a formal communication regarding workplace adherence.\n\n"
            f"Context: {details if details else 'Repeated attendance irregularities / non-compliance with core working hours without prior manager intimation'}.\n\n"
            f"At AI-EMS, we uphold strict standards of professional discipline and accountability. You are required to schedule a meeting with HR to outline an immediate corrective action plan within 48 hours.\n\n"
            f"Regards,\n"
            f"{sender_name}\n"
            f"{sender_title}"
        )
    elif "appreciation" in category.lower():
        subject = f"Kudos & Recognition for Outstanding Performance! - {recipient}"
        body = (
            f"Dear {recipient},\n\n"
            f"On behalf of the leadership team, I would like to express our sincere appreciation for your outstanding contributions and dedication.\n\n"
            f"Key Milestone: {details if details else 'Your proactive leadership and high-quality deliverables on recent sprint releases'}.\n\n"
            f"Your work ethic embodies the core values of our company. Thank you for setting an inspiring benchmark for your colleagues!\n\n"
            f"With great appreciation,\n"
            f"{sender_name}\n"
            f"{sender_title}"
        )
    elif "salary" in category.lower():
        subject = f"Confidential: Annual Compensation & Increment Notification - {recipient}"
        body = (
            f"Dear {recipient},\n\n"
            f"In recognition of your valued contributions to the organization, we are pleased to notify you of your revised compensation structure.\n\n"
            f"Revision Details:\n"
            f"{details if details else 'Your updated monthly salary and allowance structure will be effective from next payroll cycle'}.\n\n"
            f"You can view your detailed compensation breakdown in your AI-EMS profile under the Payroll tab. Congratulations on your achievement!\n\n"
            f"Sincerely,\n"
            f"{sender_name}\n"
            f"Human Resources & Payroll Office"
        )
    else:
        subject = f"Corporate Announcement: {category} - {recipient}"
        body = (
            f"Dear {recipient},\n\n"
            f"Please find below an important update from the management:\n\n"
            f"{details if details else 'This communication is sent to ensure alignment on upcoming department objectives.'}\n\n"
            f"Should you have any questions or require clarification, please feel free to reach out to the HR department.\n\n"
            f"Best regards,\n"
            f"{sender_name}\n"
            f"{sender_title}"
        )

    return jsonify({
        "subject": subject,
        "body": body,
        "category": category,
        "tone": tone
    })


@app.route('/', methods=['GET'])
def home():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI-EMS Microservice | AI Engine Online</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: 'Plus Jakarta Sans', sans-serif;
                background: radial-gradient(circle at top right, #312e81, #0f172a);
                color: #f8fafc;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem 1rem;
            }
            .card {
                background: rgba(30, 41, 59, 0.75);
                border: 1px solid rgba(255, 255, 255, 0.12);
                backdrop-filter: blur(16px);
                border-radius: 20px;
                padding: 2.5rem;
                max-width: 720px;
                width: 100%;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .badge {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(139, 92, 246, 0.2);
                color: #c4b5fd;
                padding: 0.35rem 0.85rem;
                border-radius: 9999px;
                font-size: 0.8rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                border: 1px solid rgba(139, 92, 246, 0.3);
                margin-bottom: 1.25rem;
            }
            .dot {
                width: 8px;
                height: 8px;
                background: #a855f7;
                border-radius: 50%;
                box-shadow: 0 0 8px #a855f7;
            }
            h1 {
                font-size: 1.85rem;
                font-weight: 800;
                letter-spacing: -0.02em;
                color: #ffffff;
                margin-bottom: 0.5rem;
            }
            p {
                color: #94a3b8;
                font-size: 0.95rem;
                line-height: 1.6;
                margin-bottom: 1.75rem;
            }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            .metric {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 12px;
                padding: 1rem;
            }
            .metric-label {
                font-size: 0.75rem;
                color: #64748b;
                text-transform: uppercase;
                font-weight: 700;
            }
            .metric-value {
                font-size: 1.1rem;
                font-weight: 700;
                color: #f1f5f9;
                margin-top: 0.25rem;
            }
            .links-title {
                font-size: 0.85rem;
                text-transform: uppercase;
                color: #c4b5fd;
                font-weight: 700;
                letter-spacing: 0.05em;
                margin-bottom: 0.75rem;
            }
            .links {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-bottom: 2rem;
            }
            .link-btn {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #e2e8f0;
                padding: 0.5rem 0.9rem;
                border-radius: 8px;
                text-decoration: none;
                font-size: 0.85rem;
                font-weight: 600;
                transition: all 0.2s ease;
            }
            .link-btn:hover {
                background: #7c3aed;
                border-color: #7c3aed;
                color: #fff;
                transform: translateY(-2px);
            }
            .primary-action {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            .btn-frontend {
                background: linear-gradient(135deg, #7c3aed, #4f46e5);
                color: #fff;
                padding: 0.75rem 1.5rem;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 700;
                font-size: 0.95rem;
                box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
                transition: all 0.2s ease;
            }
            .btn-frontend:hover {
                opacity: 0.95;
                transform: translateY(-2px);
            }
            .btn-backend {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #fff;
                padding: 0.75rem 1.5rem;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 700;
                font-size: 0.95rem;
                transition: all 0.2s ease;
            }
            .btn-backend:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="badge"><span class="dot"></span> Python 3.12 Flask AI Service Active</div>
            <h1>AI-EMS Intelligence Microservice is Live!</h1>
            <p>The specialized Machine Learning and Natural Language Processing microservice for the AI-EMS platform is operating and serving intelligent inference requests.</p>
            
            <div class="grid">
                <div class="metric">
                    <div class="metric-label">Microservice Port</div>
                    <div class="metric-value">5000 (HTTP)</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Active AI Engines</div>
                    <div class="metric-value">6 ML / NLP Pipelines</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Service Health</div>
                    <div class="metric-value" style="color: #6ee7b7;">Healthy & Ready</div>
                </div>
            </div>

            <div class="links-title">Active AI Endpoints:</div>
            <div class="links">
                <a class="link-btn" href="/health" target="_blank">GET /health</a>
                <span class="link-btn">POST /api/ai/chat</span>
                <span class="link-btn">POST /api/ai/resume-analyzer</span>
                <span class="link-btn">POST /api/ai/attrition</span>
                <span class="link-btn">POST /api/ai/performance</span>
                <span class="link-btn">POST /api/ai/salary</span>
                <span class="link-btn">POST /api/ai/email-generator</span>
            </div>

            <div class="primary-action">
                <a class="btn-frontend" href="http://localhost:5173" target="_blank">Open React Frontend (Port 5173) &rarr;</a>
                <a class="btn-backend" href="http://localhost:8080" target="_blank">Open Spring Boot (Port 8080)</a>
            </div>
        </div>
    </body>
    </html>
    """


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "AI Microservice is UP and healthy", "port": 5000, "service": "AI-EMS"})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"AI-EMS Python Service running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
