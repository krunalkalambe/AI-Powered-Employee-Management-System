package com.ems.controller;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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
import com.ems.entity.LeaveRequest;
import com.ems.repo.EmployeeRepo;
import com.ems.repo.LeaveRepo;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin("*")
public class LeaveController {

	@Autowired
	private LeaveRepo leaveRepo;

	@Autowired
	private EmployeeRepo employeeRepo;

	@PostMapping("/apply")
	public ResponseEntity<?> applyLeave(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		String leaveType = request.get("leaveType");
		String startDateStr = request.get("startDate");
		String endDateStr = request.get("endDate");
		String reason = request.get("reason");

		if (email == null || startDateStr == null || endDateStr == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Email, start date, and end date are required"));
		}

		Employee emp = employeeRepo.findByEmail(email.trim().toLowerCase());
		if (emp == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Employee not found"));
		}

		LocalDate start = LocalDate.parse(startDateStr);
		LocalDate end = LocalDate.parse(endDateStr);
		long days = ChronoUnit.DAYS.between(start, end) + 1;
		if (days <= 0) {
			return ResponseEntity.badRequest().body(Map.of("message", "End date must be on or after start date"));
		}

		LeaveRequest leave = new LeaveRequest();
		leave.setEmployeeId(emp.getEmpId() != null ? emp.getEmpId() : "EMP-" + emp.getId());
		leave.setEmployeeName(emp.getFname());
		leave.setEmployeeEmail(emp.getEmail());
		leave.setDepartment(emp.getDepartment() != null ? emp.getDepartment() : "General");
		leave.setLeaveType(leaveType != null ? leaveType : "Casual");
		leave.setStartDate(start);
		leave.setEndDate(end);
		leave.setTotalDays((int) days);
		leave.setReason(reason);
		leave.setStatus("PENDING");
		leave.setAppliedDate(LocalDate.now());

		LeaveRequest saved = leaveRepo.save(leave);
		return ResponseEntity.ok(saved);
	}

	@GetMapping("/my")
	public ResponseEntity<List<LeaveRequest>> getMyLeaves(@RequestParam String email) {
		return ResponseEntity.ok(leaveRepo.findByEmployeeEmailOrderByAppliedDateDesc(email.trim().toLowerCase()));
	}

	@GetMapping("/all")
	public ResponseEntity<List<LeaveRequest>> getAllLeaves(
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String department) {
		if (status != null && !status.trim().isEmpty()) {
			return ResponseEntity.ok(leaveRepo.findByStatus(status.toUpperCase()));
		}
		if (department != null && !department.trim().isEmpty()) {
			return ResponseEntity.ok(leaveRepo.findByDepartment(department));
		}
		return ResponseEntity.ok(leaveRepo.findAllByOrderByAppliedDateDesc());
	}

	@PutMapping("/{id}/status")
	public ResponseEntity<?> updateLeaveStatus(
			@PathVariable Long id,
			@RequestBody Map<String, String> body) {
		Optional<LeaveRequest> leaveOpt = leaveRepo.findById(id);
		if (leaveOpt.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		String status = body.get("status"); // APPROVED, REJECTED
		String reviewedBy = body.get("reviewedBy");
		String remarks = body.get("remarks");

		if (status == null || (!status.equalsIgnoreCase("APPROVED") && !status.equalsIgnoreCase("REJECTED"))) {
			return ResponseEntity.badRequest().body(Map.of("message", "Status must be APPROVED or REJECTED"));
		}

		LeaveRequest leave = leaveOpt.get();
		leave.setStatus(status.toUpperCase());
		leave.setReviewedBy(reviewedBy);
		leave.setReviewRemarks(remarks);

		// If approved, optionally set employee status to ON_LEAVE
		if ("APPROVED".equalsIgnoreCase(status)) {
			Employee emp = employeeRepo.findByEmail(leave.getEmployeeEmail());
			if (emp != null && LocalDate.now().isAfter(leave.getStartDate().minusDays(1))
					&& LocalDate.now().isBefore(leave.getEndDate().plusDays(1))) {
				emp.setStatus("ON_LEAVE");
				employeeRepo.save(emp);
			}
		}

		LeaveRequest updated = leaveRepo.save(leave);
		return ResponseEntity.ok(updated);
	}

	@GetMapping("/stats")
	public ResponseEntity<?> getLeaveStats() {
		long pending = leaveRepo.countByStatus("PENDING");
		long approved = leaveRepo.countByStatus("APPROVED");
		long rejected = leaveRepo.countByStatus("REJECTED");
		long total = pending + approved + rejected;

		Map<String, Object> stats = new HashMap<>();
		stats.put("totalRequests", total);
		stats.put("pending", pending);
		stats.put("approved", approved);
		stats.put("rejected", rejected);

		return ResponseEntity.ok(stats);
	}
}
