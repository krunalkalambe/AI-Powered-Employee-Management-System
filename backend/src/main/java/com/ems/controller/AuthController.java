package com.ems.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ems.entity.Employee;
import com.ems.entity.User;
import com.ems.repo.EmployeeRepo;
import com.ems.repo.UserRepo;
import com.ems.security.JwtUtil;
import com.ems.security.PasswordUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

	@Autowired
	private UserRepo userRepo;

	@Autowired
	private EmployeeRepo employeeRepo;

	@Autowired
	private JwtUtil jwtUtil;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		String password = request.get("password");

		if (email == null || password == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
		}

		Optional<User> userOpt = userRepo.findByEmail(email.trim().toLowerCase());
		if (userOpt.isEmpty()) {
			// Check if employee exists and can log in
			Employee emp = employeeRepo.findByEmail(email.trim().toLowerCase());
			if (emp != null && password.equals("emp123")) {
				// Auto-create user for existing employee
				User u = new User(emp.getEmail(), PasswordUtil.hashPassword("emp123"), emp.getFname(),
						emp.getRole() != null ? emp.getRole() : "EMPLOYEE", emp.getEmpId());
				userRepo.save(u);
				userOpt = Optional.of(u);
			} else {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Map.of("message", "Invalid email or password"));
			}
		}

		User user = userOpt.get();
		if (!PasswordUtil.verifyPassword(password, user.getPassword())) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("message", "Invalid email or password"));
		}

		String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getName(), user.getEmployeeId());

		Map<String, Object> response = new HashMap<>();
		response.put("token", token);
		response.put("role", user.getRole());
		response.put("message", "Login Successful");
		response.put("email", user.getEmail());
		response.put("name", user.getName());
		response.put("employeeId", user.getEmployeeId());

		return ResponseEntity.ok(response);
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		String password = request.get("password");
		String name = request.get("name");
		String role = request.get("role");

		if (email == null || password == null || name == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Email, password, and name are required"));
		}

		email = email.trim().toLowerCase();
		if (userRepo.existsByEmail(email)) {
			return ResponseEntity.badRequest().body(Map.of("message", "User with this email already exists"));
		}

		if (role == null || role.trim().isEmpty()) {
			role = "EMPLOYEE";
		}

		long empCount = employeeRepo.count() + 1;
		String empId = String.format("EMP-%04d", empCount);

		// Also create Employee record if not existing
		Employee emp = employeeRepo.findByEmail(email);
		if (emp == null) {
			emp = new Employee();
			emp.setEmail(email);
			emp.setFname(name);
			emp.setEmpId(empId);
			emp.setRole(role);
			emp.setStatus("ACTIVE");
			emp.setDepartment("Engineering");
			employeeRepo.save(emp);
		} else {
			empId = emp.getEmpId() != null ? emp.getEmpId() : empId;
		}

		User user = new User(email, PasswordUtil.hashPassword(password), name, role, empId);
		userRepo.save(user);

		String token = jwtUtil.generateToken(email, role, name, empId);
		Map<String, Object> response = new HashMap<>();
		response.put("token", token);
		response.put("role", role);
		response.put("message", "Registration Successful");
		response.put("email", email);
		response.put("name", name);
		response.put("employeeId", empId);

		return ResponseEntity.ok(response);
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		if (email == null || email.trim().isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
		}

		email = email.trim().toLowerCase();
		Optional<User> userOpt = userRepo.findByEmail(email);
		if (userOpt.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("message", "No user found with this email address"));
		}

		User user = userOpt.get();
		String otp = String.format("%06d", new Random().nextInt(999999));
		user.setOtp(otp);
		user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
		userRepo.save(user);

		Map<String, Object> resp = new HashMap<>();
		resp.put("message", "OTP sent successfully to " + email);
		// Return OTP in response so users can test immediately in local/viva presentations without SMTP configured
		resp.put("otp", otp);
		return ResponseEntity.ok(resp);
	}

	@PostMapping("/verify-otp")
	public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		String otp = request.get("otp");

		if (email == null || otp == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required"));
		}

		email = email.trim().toLowerCase();
		Optional<User> userOpt = userRepo.findByEmail(email);
		if (userOpt.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
		}

		User user = userOpt.get();
		if (user.getOtp() == null || !user.getOtp().equals(otp.trim())) {
			return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP code"));
		}

		if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
			return ResponseEntity.badRequest().body(Map.of("message", "OTP has expired. Please request a new one."));
		}

		return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		String otp = request.get("otp");
		String newPassword = request.get("newPassword");

		if (email == null || otp == null || newPassword == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Email, OTP, and new password are required"));
		}

		email = email.trim().toLowerCase();
		Optional<User> userOpt = userRepo.findByEmail(email);
		if (userOpt.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
		}

		User user = userOpt.get();
		if (user.getOtp() == null || !user.getOtp().equals(otp.trim())) {
			return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP"));
		}

		user.setPassword(PasswordUtil.hashPassword(newPassword));
		user.setOtp(null);
		user.setOtpExpiry(null);
		userRepo.save(user);

		return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in."));
	}

	@GetMapping("/me")
	public ResponseEntity<?> getMe(@RequestHeader(value = "Authorization", required = false) String authHeader) {
		if (authHeader == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "No token provided"));
		}

		Map<String, Object> claims = jwtUtil.validateAndExtractClaims(authHeader);
		if (claims == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired token"));
		}

		String email = (String) claims.get("email");
		Optional<User> userOpt = userRepo.findByEmail(email);
		if (userOpt.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User profile not found"));
		}

		User user = userOpt.get();
		Employee emp = employeeRepo.findByEmail(email);

		Map<String, Object> profile = new HashMap<>();
		profile.put("id", user.getId());
		profile.put("email", user.getEmail());
		profile.put("name", user.getName());
		profile.put("role", user.getRole());
		profile.put("employeeId", user.getEmployeeId());
		if (emp != null) {
			profile.put("department", emp.getDepartment());
			profile.put("designation", emp.getDesig());
			profile.put("salary", emp.getSal());
			profile.put("mobile", emp.getMobile());
			profile.put("address", emp.getAddress());
			profile.put("joiningDate", emp.getJdate());
			profile.put("status", emp.getStatus());
		}

		return ResponseEntity.ok(profile);
	}
}
