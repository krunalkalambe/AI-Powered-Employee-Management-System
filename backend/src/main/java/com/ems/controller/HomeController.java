package com.ems.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin("*")
public class HomeController {

	@GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
	public String home() {
		return """
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>AI-EMS Backend | System Online</title>
				<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
				<style>
					* { box-sizing: border-box; margin: 0; padding: 0; }
					body {
						font-family: 'Plus Jakarta Sans', sans-serif;
						background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
						color: #f8fafc;
						min-height: 100vh;
						display: flex;
						align-items: center;
						justify-content: center;
						padding: 2rem 1rem;
					}
					.card {
						background: rgba(30, 41, 59, 0.7);
						border: 1px solid rgba(255, 255, 255, 0.1);
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
						background: rgba(16, 185, 129, 0.2);
						color: #6ee7b7;
						padding: 0.35rem 0.85rem;
						border-radius: 9999px;
						font-size: 0.8rem;
						font-weight: 700;
						text-transform: uppercase;
						letter-spacing: 0.05em;
						border: 1px solid rgba(16, 185, 129, 0.3);
						margin-bottom: 1.25rem;
					}
					.dot {
						width: 8px;
						height: 8px;
						background: #10b981;
						border-radius: 50%;
						box-shadow: 0 0 8px #10b981;
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
						color: #a5b4fc;
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
						background: #4f46e5;
						border-color: #4f46e5;
						color: #fff;
						transform: translateY(-2px);
					}
					.primary-action {
						display: flex;
						gap: 1rem;
						flex-wrap: wrap;
					}
					.btn-frontend {
						background: linear-gradient(135deg, #4f46e5, #8b5cf6);
						color: #fff;
						padding: 0.75rem 1.5rem;
						border-radius: 10px;
						text-decoration: none;
						font-weight: 700;
						font-size: 0.95rem;
						box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
						transition: all 0.2s ease;
					}
					.btn-frontend:hover {
						opacity: 0.95;
						transform: translateY(-2px);
					}
					.btn-ai {
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
					.btn-ai:hover {
						background: rgba(255, 255, 255, 0.15);
						transform: translateY(-2px);
					}
				</style>
			</head>
			<body>
				<div class="card">
					<div class="badge"><span class="dot"></span> Spring Boot 4.0.6 Active</div>
					<h1>AI-EMS Backend Service is Live!</h1>
					<p>The core REST API engine for the AI-Powered Employee Management System is running smoothly and connected to the MySQL 8.0 database.</p>
					
					<div class="grid">
						<div class="metric">
							<div class="metric-label">Server Port</div>
							<div class="metric-value">8080 (HTTP)</div>
						</div>
						<div class="metric">
							<div class="metric-label">Database Connection</div>
							<div class="metric-value">MySQL 8.0 (`ems`)</div>
						</div>
						<div class="metric">
							<div class="metric-label">Security Protocol</div>
							<div class="metric-value">JWT HMAC-SHA256</div>
						</div>
					</div>

					<div class="links-title">Quick REST Endpoints (Click to inspect JSON):</div>
					<div class="links">
						<a class="link-btn" href="/api/employees" target="_blank">/api/employees</a>
						<a class="link-btn" href="/api/departments" target="_blank">/api/departments</a>
						<a class="link-btn" href="/api/attendance/stats" target="_blank">/api/attendance/stats</a>
						<a class="link-btn" href="/api/leaves/stats" target="_blank">/api/leaves/stats</a>
						<a class="link-btn" href="/api/payroll/stats" target="_blank">/api/payroll/stats</a>
						<a class="link-btn" href="/api/reports/summary" target="_blank">/api/reports/summary</a>
					</div>

					<div class="primary-action">
						<a class="btn-frontend" href="http://localhost:5173" target="_blank">Open React Frontend (Port 5173) &rarr;</a>
						<a class="btn-ai" href="http://localhost:5000" target="_blank">Open AI Microservice (Port 5000)</a>
					</div>
				</div>
			</body>
			</html>
		""";
	}
}
