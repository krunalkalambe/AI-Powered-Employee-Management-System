package com.ems.controller;

import java.time.LocalDate;
import java.time.LocalTime;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ems.entity.Attendance;
import com.ems.entity.Employee;
import com.ems.repo.AttendanceRepo;
import com.ems.repo.EmployeeRepo;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
public class AttendanceController {

	@Autowired
	private AttendanceRepo attendanceRepo;

	@Autowired
	private EmployeeRepo employeeRepo;

	@PostMapping("/mark")
	public ResponseEntity<?> markAttendance(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		String status = request.get("status"); // PRESENT, ABSENT, LATE, HALF_DAY
		String remarks = request.get("remarks");
		String action = request.get("action"); // "CHECK_IN" or "CHECK_OUT"

		if (email == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Employee email is required"));
		}

		Employee emp = employeeRepo.findByEmail(email.trim().toLowerCase());
		if (emp == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Employee not found"));
		}

		LocalDate today = LocalDate.now();
		Optional<Attendance> existingOpt = attendanceRepo.findByEmployeeEmailAndDate(emp.getEmail(), today);

		Attendance record;
		if (existingOpt.isPresent()) {
			record = existingOpt.get();
			if ("CHECK_OUT".equalsIgnoreCase(action)) {
				record.setCheckOutTime(LocalTime.now());
			} else {
				if (status != null) record.setStatus(status);
				if (remarks != null) record.setRemarks(remarks);
			}
		} else {
			record = new Attendance();
			record.setEmployeeId(emp.getEmpId() != null ? emp.getEmpId() : "EMP-" + emp.getId());
			record.setEmployeeName(emp.getFname());
			record.setEmployeeEmail(emp.getEmail());
			record.setDate(today);
			record.setCheckInTime(LocalTime.now());
			record.setStatus(status != null ? status : "PRESENT");
			record.setRemarks(remarks);
		}

		Attendance saved = attendanceRepo.save(record);
		return ResponseEntity.ok(saved);
	}

	@GetMapping("/today")
	public ResponseEntity<List<Attendance>> getTodayAttendance() {
		return ResponseEntity.ok(attendanceRepo.findByDate(LocalDate.now()));
	}

	@GetMapping("/employee/{email}")
	public ResponseEntity<?> getEmployeeAttendance(@PathVariable String email) {
		List<Attendance> records = attendanceRepo.findByEmployeeEmailOrderByDateDesc(email.trim().toLowerCase());
		long total = records.size();
		long presentCount = records.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
		long lateCount = records.stream().filter(r -> "LATE".equalsIgnoreCase(r.getStatus())).count();
		long absentCount = records.stream().filter(r -> "ABSENT".equalsIgnoreCase(r.getStatus())).count();

		double percentage = total > 0 ? ((double) (presentCount + lateCount) / total) * 100 : 100.0;

		Map<String, Object> resp = new HashMap<>();
		resp.put("records", records);
		resp.put("totalDays", total);
		resp.put("presentCount", presentCount);
		resp.put("lateCount", lateCount);
		resp.put("absentCount", absentCount);
		resp.put("attendancePercentage", Math.round(percentage * 10.0) / 10.0);

		return ResponseEntity.ok(resp);
	}

	@GetMapping("/all")
	public ResponseEntity<List<Attendance>> getAllAttendance(
			@RequestParam(required = false) String date,
			@RequestParam(required = false) String email) {
		if (email != null && !email.trim().isEmpty()) {
			return ResponseEntity.ok(attendanceRepo.findByEmployeeEmailOrderByDateDesc(email.trim().toLowerCase()));
		}
		if (date != null && !date.trim().isEmpty()) {
			return ResponseEntity.ok(attendanceRepo.findByDate(LocalDate.parse(date)));
		}
		return ResponseEntity.ok(attendanceRepo.findAll());
	}

	@GetMapping("/stats")
	public ResponseEntity<?> getAttendanceStats() {
		LocalDate today = LocalDate.now();
		long totalEmployees = employeeRepo.count();
		long presentToday = attendanceRepo.countByDateAndStatus(today, "PRESENT");
		long lateToday = attendanceRepo.countByDateAndStatus(today, "LATE");
		long absentToday = attendanceRepo.countByDateAndStatus(today, "ABSENT");

		long markedToday = presentToday + lateToday + absentToday;
		long unmarkedToday = Math.max(0, totalEmployees - markedToday);

		double rate = totalEmployees > 0 ? ((double) (presentToday + lateToday) / totalEmployees) * 100 : 0.0;

		Map<String, Object> stats = new HashMap<>();
		stats.put("totalEmployees", totalEmployees);
		stats.put("presentToday", presentToday);
		stats.put("lateToday", lateToday);
		stats.put("absentToday", absentToday);
		stats.put("unmarkedToday", unmarkedToday);
		stats.put("attendanceRateToday", Math.round(rate * 10.0) / 10.0);

		return ResponseEntity.ok(stats);
	}
}
