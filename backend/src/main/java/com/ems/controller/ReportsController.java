package com.ems.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ems.entity.Attendance;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.LeaveRequest;
import com.ems.entity.Payroll;
import com.ems.repo.AttendanceRepo;
import com.ems.repo.DepartmentRepo;
import com.ems.repo.EmployeeRepo;
import com.ems.repo.LeaveRepo;
import com.ems.repo.PayrollRepo;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("*")
public class ReportsController {

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

	@GetMapping("/summary")
	public ResponseEntity<?> getSystemSummary() {
		long totalEmployees = employeeRepo.count();
		long totalDepartments = departmentRepo.count();
		LocalDate today = LocalDate.now();

		long presentToday = attendanceRepo.countByDateAndStatus(today, "PRESENT");
		long absentToday = attendanceRepo.countByDateAndStatus(today, "ABSENT");
		long pendingLeaves = leaveRepo.countByStatus("PENDING");

		List<Payroll> payrollList = payrollRepo.findAll();
		double totalPayroll = payrollList.stream().mapToDouble(Payroll::getNetSalary).sum();

		Map<String, Object> summary = new HashMap<>();
		summary.put("totalEmployees", totalEmployees);
		summary.put("totalDepartments", totalDepartments);
		summary.put("presentToday", presentToday);
		summary.put("absentToday", absentToday);
		summary.put("pendingLeaves", pendingLeaves);
		summary.put("totalPayroll", totalPayroll);

		return ResponseEntity.ok(summary);
	}

	@GetMapping("/export/{type}")
	public ResponseEntity<byte[]> exportReportCsv(@PathVariable String type) {
		StringBuilder csv = new StringBuilder();
		String filename = type.toLowerCase() + "_report.csv";

		switch (type.toLowerCase()) {
		case "employee":
		case "employees":
			csv.append("ID,Employee ID,Name,Email,Department,Designation,Salary,Mobile,Gender,Joining Date,Status\n");
			for (Employee e : employeeRepo.findAll()) {
				csv.append(String.format("%s,%s,\"%s\",%s,\"%s\",\"%s\",%s,%s,%s,%s,%s\n",
						e.getId(),
						e.getEmpId() != null ? e.getEmpId() : "",
						e.getFname() != null ? e.getFname() : "",
						e.getEmail() != null ? e.getEmail() : "",
						e.getDepartment() != null ? e.getDepartment() : "",
						e.getDesig() != null ? e.getDesig() : "",
						e.getSal() != null ? e.getSal() : 0,
						e.getMobile() != null ? e.getMobile() : "",
						e.getGender() != null ? e.getGender() : "",
						e.getJdate() != null ? e.getJdate() : "",
						e.getStatus() != null ? e.getStatus() : "ACTIVE"));
			}
			break;

		case "department":
		case "departments":
			csv.append("ID,Department Name,Manager Name,Manager Email,Location,Budget,Employee Count\n");
			for (Department d : departmentRepo.findAll()) {
				csv.append(String.format("%s,\"%s\",\"%s\",%s,\"%s\",%s,%s\n",
						d.getId(),
						d.getName(),
						d.getManagerName() != null ? d.getManagerName() : "",
						d.getManagerEmail() != null ? d.getManagerEmail() : "",
						d.getLocation() != null ? d.getLocation() : "",
						d.getBudget() != null ? d.getBudget() : 0.0,
						employeeRepo.countByDepartment(d.getName())));
			}
			break;

		case "attendance":
			csv.append("ID,Employee ID,Employee Name,Email,Date,Status,Check In,Check Out,Remarks\n");
			for (Attendance a : attendanceRepo.findAll()) {
				csv.append(String.format("%s,%s,\"%s\",%s,%s,%s,%s,%s,\"%s\"\n",
						a.getId(),
						a.getEmployeeId() != null ? a.getEmployeeId() : "",
						a.getEmployeeName() != null ? a.getEmployeeName() : "",
						a.getEmployeeEmail() != null ? a.getEmployeeEmail() : "",
						a.getDate(),
						a.getStatus(),
						a.getCheckInTime() != null ? a.getCheckInTime() : "",
						a.getCheckOutTime() != null ? a.getCheckOutTime() : "",
						a.getRemarks() != null ? a.getRemarks() : ""));
			}
			break;

		case "leave":
		case "leaves":
			csv.append("ID,Employee ID,Employee Name,Leave Type,Start Date,End Date,Days,Reason,Status,Applied Date\n");
			for (LeaveRequest l : leaveRepo.findAll()) {
				csv.append(String.format("%s,%s,\"%s\",%s,%s,%s,%s,\"%s\",%s,%s\n",
						l.getId(),
						l.getEmployeeId() != null ? l.getEmployeeId() : "",
						l.getEmployeeName() != null ? l.getEmployeeName() : "",
						l.getLeaveType(),
						l.getStartDate(),
						l.getEndDate(),
						l.getTotalDays(),
						l.getReason() != null ? l.getReason().replace("\"", "\"\"") : "",
						l.getStatus(),
						l.getAppliedDate()));
			}
			break;

		case "payroll":
			csv.append("ID,Employee ID,Employee Name,Month,Year,Basic Salary,Allowance,Deduction,Net Salary,Payment Status,Payment Date\n");
			for (Payroll p : payrollRepo.findAll()) {
				csv.append(String.format("%s,%s,\"%s\",%s,%s,%.2f,%.2f,%.2f,%.2f,%s,%s\n",
						p.getId(),
						p.getEmployeeId() != null ? p.getEmployeeId() : "",
						p.getEmployeeName() != null ? p.getEmployeeName() : "",
						p.getMonth(),
						p.getYear(),
						p.getBasicSalary() != null ? p.getBasicSalary() : 0.0,
						p.getAllowance() != null ? p.getAllowance() : 0.0,
						p.getDeduction() != null ? p.getDeduction() : 0.0,
						p.getNetSalary() != null ? p.getNetSalary() : 0.0,
						p.getPaymentStatus(),
						p.getPaymentDate() != null ? p.getPaymentDate() : ""));
			}
			break;

		default:
			return ResponseEntity.badRequest().build();
		}

		byte[] bytes = csv.toString().getBytes();
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
				.contentType(MediaType.parseMediaType("text/csv"))
				.body(bytes);
	}
}
