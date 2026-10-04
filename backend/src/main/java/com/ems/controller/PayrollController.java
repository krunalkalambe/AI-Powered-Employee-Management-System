package com.ems.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ems.entity.Employee;
import com.ems.entity.Payroll;
import com.ems.repo.EmployeeRepo;
import com.ems.repo.PayrollRepo;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin("*")
public class PayrollController {

	@Autowired
	private PayrollRepo payrollRepo;

	@Autowired
	private EmployeeRepo employeeRepo;

	@PostMapping("/generate")
	public ResponseEntity<?> generatePayroll(@RequestBody Map<String, Object> request) {
		String email = (String) request.get("email");
		String month = (String) request.get("month");
		Number yearNum = (Number) request.get("year");
		Number basicNum = (Number) request.get("basicSalary");
		Number allowNum = (Number) request.get("allowance");
		Number deductNum = (Number) request.get("deduction");
		String status = (String) request.get("paymentStatus");

		if (email == null || month == null || yearNum == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Email, month, and year are required"));
		}

		Employee emp = employeeRepo.findByEmail(email.trim().toLowerCase());
		if (emp == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Employee not found with email: " + email));
		}

		int year = yearNum.intValue();
		double basic = basicNum != null ? basicNum.doubleValue() : (emp.getSal() != null ? emp.getSal().doubleValue() : 0.0);
		double allowance = allowNum != null ? allowNum.doubleValue() : (emp.getInc() != null ? emp.getInc().doubleValue() : 0.0);
		double deduction = deductNum != null ? deductNum.doubleValue() : 0.0;
		String payStatus = status != null ? status.toUpperCase() : "PENDING";

		String empId = emp.getEmpId() != null ? emp.getEmpId() : "EMP-" + emp.getId();
		Optional<Payroll> existingOpt = payrollRepo.findByEmployeeIdAndMonthAndYear(empId, month, year);

		Payroll payroll = existingOpt.orElseGet(Payroll::new);
		payroll.setEmployeeId(empId);
		payroll.setEmployeeName(emp.getFname());
		payroll.setEmployeeEmail(emp.getEmail());
		payroll.setDepartment(emp.getDepartment() != null ? emp.getDepartment() : "Engineering");
		payroll.setMonth(month);
		payroll.setYear(year);
		payroll.setBasicSalary(basic);
		payroll.setAllowance(allowance);
		payroll.setDeduction(deduction);
		payroll.setNetSalary(basic + allowance - deduction); // Net Salary = Basic + Allowance - Deduction
		payroll.setPaymentStatus(payStatus);
		if ("PAID".equalsIgnoreCase(payStatus)) {
			payroll.setPaymentDate(LocalDate.now());
		}

		Payroll saved = payrollRepo.save(payroll);
		return ResponseEntity.ok(saved);
	}

	@GetMapping("/all")
	public ResponseEntity<List<Payroll>> getAllPayroll(
			@RequestParam(required = false) String month,
			@RequestParam(required = false) Integer year,
			@RequestParam(required = false) String email) {
		if (email != null && !email.trim().isEmpty()) {
			return ResponseEntity.ok(payrollRepo.findByEmployeeEmailOrderByYearDescMonthDesc(email.trim().toLowerCase()));
		}
		if (month != null && year != null) {
			return ResponseEntity.ok(payrollRepo.findByMonthAndYear(month, year));
		}
		return ResponseEntity.ok(payrollRepo.findAllByOrderByYearDescMonthDesc());
	}

	@GetMapping("/employee/{email}")
	public ResponseEntity<List<Payroll>> getEmployeePayroll(@PathVariable String email) {
		return ResponseEntity.ok(payrollRepo.findByEmployeeEmailOrderByYearDescMonthDesc(email.trim().toLowerCase()));
	}

	@PutMapping("/{id}/status")
	public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
		Optional<Payroll> opt = payrollRepo.findById(id);
		if (opt.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		String status = body.get("paymentStatus");
		if (status == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Payment status is required"));
		}

		Payroll p = opt.get();
		p.setPaymentStatus(status.toUpperCase());
		if ("PAID".equalsIgnoreCase(status)) {
			p.setPaymentDate(LocalDate.now());
		}
		payrollRepo.save(p);

		return ResponseEntity.ok(p);
	}

	@GetMapping("/stats")
	public ResponseEntity<?> getPayrollStats() {
		List<Payroll> all = payrollRepo.findAll();
		double totalNet = all.stream().mapToDouble(Payroll::getNetSalary).sum();
		long paidCount = all.stream().filter(p -> "PAID".equalsIgnoreCase(p.getPaymentStatus())).count();
		long pendingCount = all.stream().filter(p -> "PENDING".equalsIgnoreCase(p.getPaymentStatus())).count();

		Map<String, Object> stats = new HashMap<>();
		stats.put("totalRecords", all.size());
		stats.put("totalDisbursedOrScheduled", totalNet);
		stats.put("paidCount", paidCount);
		stats.put("pendingCount", pendingCount);

		return ResponseEntity.ok(stats);
	}
}
