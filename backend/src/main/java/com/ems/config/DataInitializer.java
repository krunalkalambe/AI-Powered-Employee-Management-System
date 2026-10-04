package com.ems.config;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.ems.entity.Attendance;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.LeaveRequest;
import com.ems.entity.Payroll;
import com.ems.entity.User;
import com.ems.repo.AttendanceRepo;
import com.ems.repo.DepartmentRepo;
import com.ems.repo.EmployeeRepo;
import com.ems.repo.LeaveRepo;
import com.ems.repo.PayrollRepo;
import com.ems.repo.UserRepo;
import com.ems.security.PasswordUtil;

@Component
public class DataInitializer implements CommandLineRunner {

	@Autowired
	private UserRepo userRepo;

	@Autowired
	private EmployeeRepo employeeRepo;

	@Autowired
	private DepartmentRepo departmentRepo;

	@Autowired
	private AttendanceRepo attendanceRepo;

	@Autowired
	private LeaveRepo leaveRepo;

	@Autowired
	private PayrollRepo payrollRepo;

	@Override
	public void run(String... args) throws Exception {
		// 1. Seed Departments
		if (departmentRepo.count() == 0) {
			departmentRepo.save(new Department("Engineering", "Software development, QA, and cloud infrastructure", "Krunal Kalambe", "manager@ems.com", "Building A - Floor 4", 2500000.0));
			departmentRepo.save(new Department("Human Resources", "Talent acquisition, employee welfare, and payroll", "Aarti Ghayde", "hr@ems.com", "Building A - Floor 2", 800000.0));
			departmentRepo.save(new Department("Finance & Accounts", "Financial audits, taxation, and budget allocation", "Siddharth Jain", "finance@ems.com", "Building B - Floor 1", 1200000.0));
			departmentRepo.save(new Department("Sales & Marketing", "Client acquisition, branding, and enterprise sales", "Neha Verma", "sales@ems.com", "Building B - Floor 3", 1800000.0));
			departmentRepo.save(new Department("Operations", "Facilities, logistics, and company administration", "Rohan Das", "ops@ems.com", "Building A - Ground Floor", 600000.0));
		}

		// 2. Update existing employees with missing fields
		List<Employee> existingEmps = employeeRepo.findAll();
		long idx = 1;
		for (Employee e : existingEmps) {
			boolean changed = false;
			if (e.getEmpId() == null || e.getEmpId().trim().isEmpty()) {
				e.setEmpId(String.format("EMP-%04d", idx));
				changed = true;
			}
			if (e.getDepartment() == null || e.getDepartment().trim().isEmpty()) {
				e.setDepartment(idx % 2 == 1 ? "Engineering" : "Human Resources");
				changed = true;
			}
			if (e.getRole() == null || e.getRole().trim().isEmpty()) {
				e.setRole("EMPLOYEE");
				changed = true;
			}
			if (e.getStatus() == null || e.getStatus().trim().isEmpty()) {
				e.setStatus("ACTIVE");
				changed = true;
			}
			if (e.getSkills() == null) {
				e.setSkills("Java, Spring Boot, React, MySQL, REST APIs");
				changed = true;
			}
			if (e.getExperienceYears() == null) {
				e.setExperienceYears(2.5);
				changed = true;
			}
			if (e.getPerformanceScore() == null) {
				e.setPerformanceScore(4.2);
				changed = true;
			}
			if (changed) {
				employeeRepo.save(e);
			}
			idx++;
		}

		// 3. Seed Users
		if (!userRepo.existsByEmail("admin@ems.com")) {
			userRepo.save(new User("admin@ems.com", PasswordUtil.hashPassword("admin123"), "System Admin", "ADMIN", "EMP-0000"));
		}
		if (!userRepo.existsByEmail("hr@ems.com")) {
			userRepo.save(new User("hr@ems.com", PasswordUtil.hashPassword("hr123"), "HR Manager", "HR", "EMP-9001"));
		}
		if (!userRepo.existsByEmail("manager@ems.com")) {
			userRepo.save(new User("manager@ems.com", PasswordUtil.hashPassword("manager123"), "Engineering Manager", "MANAGER", "EMP-9002"));
		}

		// Ensure existing employee users exist
		for (Employee e : employeeRepo.findAll()) {
			if (e.getEmail() != null && !userRepo.existsByEmail(e.getEmail().toLowerCase())) {
				userRepo.save(new User(
						e.getEmail().toLowerCase(),
						PasswordUtil.hashPassword("emp123"),
						e.getFname() != null ? e.getFname() : "Employee",
						e.getRole() != null ? e.getRole() : "EMPLOYEE",
						e.getEmpId() != null ? e.getEmpId() : "EMP-" + e.getId()));
			}
		}

		// 4. Seed Today's Attendance if empty
		LocalDate today = LocalDate.now();
		if (attendanceRepo.findByDate(today).isEmpty() && !existingEmps.isEmpty()) {
			for (Employee e : existingEmps) {
				Attendance att = new Attendance();
				att.setEmployeeId(e.getEmpId());
				att.setEmployeeName(e.getFname());
				att.setEmployeeEmail(e.getEmail());
				att.setDate(today);
				att.setCheckInTime(LocalTime.of(9, 15));
				att.setStatus("PRESENT");
				att.setRemarks("On-time check in");
				attendanceRepo.save(att);
			}
		}

		// 5. Seed sample Leave Request if empty
		if (leaveRepo.count() == 0 && !existingEmps.isEmpty()) {
			Employee emp = existingEmps.get(0);
			LeaveRequest leave = new LeaveRequest();
			leave.setEmployeeId(emp.getEmpId());
			leave.setEmployeeName(emp.getFname());
			leave.setEmployeeEmail(emp.getEmail());
			leave.setDepartment(emp.getDepartment() != null ? emp.getDepartment() : "Engineering");
			leave.setLeaveType("Casual");
			leave.setStartDate(today.plusDays(3));
			leave.setEndDate(today.plusDays(4));
			leave.setTotalDays(2);
			leave.setReason("Attending family event");
			leave.setStatus("PENDING");
			leave.setAppliedDate(today.minusDays(1));
			leaveRepo.save(leave);
		}

		// 6. Seed sample Payroll if empty
		if (payrollRepo.count() == 0 && !existingEmps.isEmpty()) {
			for (Employee emp : existingEmps) {
				double basic = emp.getSal() != null ? emp.getSal().doubleValue() : 50000.0;
				double allow = emp.getInc() != null ? emp.getInc().doubleValue() : 5000.0;
				double deduct = 2000.0;
				Payroll p = new Payroll(
						emp.getEmpId(),
						emp.getFname(),
						emp.getEmail(),
						emp.getDepartment(),
						"March",
						2026,
						basic,
						allow,
						deduct,
						"PAID");
				payrollRepo.save(p);
			}
		}
	}
}
