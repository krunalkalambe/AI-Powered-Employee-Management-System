package com.ems.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ems.entity.Employee;
import com.ems.service.EmployeeService;

@RestController
@CrossOrigin("*")
public class EmployeeController {

	@Autowired
	private EmployeeService employeeService;

	// Backward-compatible original endpoints
	@PostMapping("/add")
	public ResponseEntity<?> addEmployee(@RequestBody Employee employee) {
		Employee obj = employeeService.AddData(employee);
		return ResponseEntity.ok(obj);
	}

	@PutMapping("/update")
	public ResponseEntity<?> updateEmployee(@RequestBody Employee employee) {
		ResponseEntity<?> updateobj = employeeService.UpdateData(employee);
		return updateobj;
	}

	@GetMapping("/get")
	public ResponseEntity<?> getEmployee(@RequestParam String email) {
		Employee getobj = employeeService.getData(email);
		if (getobj == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(getobj);
	}

	@DeleteMapping("/delete")
	public ResponseEntity<?> deleteEmployee(@RequestParam String email) {
		return employeeService.deleteData(email);
	}

	// Fix frontend call to /delete/{id}
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteEmployeeByIdPath(@PathVariable Long id) {
		return employeeService.deleteEmployeeById(id);
	}

	// Fix frontend call to /allemp
	@GetMapping("/allemp")
	public ResponseEntity<List<Employee>> getAllEmpLegacy() {
		return ResponseEntity.ok(employeeService.getAllEmployees());
	}

	// Modern RESTful API endpoints
	@GetMapping("/api/employees")
	public ResponseEntity<List<Employee>> getAllEmployees() {
		return ResponseEntity.ok(employeeService.getAllEmployees());
	}

	@GetMapping("/api/employees/{id}")
	public ResponseEntity<?> getEmployeeById(@PathVariable Long id) {
		Employee emp = employeeService.getEmployeeById(id);
		if (emp == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(emp);
	}

	@PostMapping("/api/employees")
	public ResponseEntity<?> createEmployee(@RequestBody Employee employee) {
		Employee saved = employeeService.AddData(employee);
		return ResponseEntity.ok(saved);
	}

	@PutMapping("/api/employees/{id}")
	public ResponseEntity<?> updateEmployeeById(@PathVariable Long id, @RequestBody Employee employee) {
		employee.setId(id);
		return employeeService.UpdateData(employee);
	}

	@DeleteMapping("/api/employees/{id}")
	public ResponseEntity<?> deleteEmployeeApi(@PathVariable Long id) {
		return employeeService.deleteEmployeeById(id);
	}

	@GetMapping("/api/employees/search")
	public ResponseEntity<List<Employee>> searchEmployees(@RequestParam(required = false) String query) {
		return ResponseEntity.ok(employeeService.searchEmployees(query));
	}

	@GetMapping("/api/employees/stats")
	public ResponseEntity<?> getEmployeeStats() {
		List<Employee> all = employeeService.getAllEmployees();
		long total = all.size();
		long active = all.stream().filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus())).count();
		long onLeave = all.stream().filter(e -> "ON_LEAVE".equalsIgnoreCase(e.getStatus())).count();

		Map<String, Long> byDepartment = new HashMap<>();
		for (Employee e : all) {
			String dept = e.getDepartment() != null ? e.getDepartment() : "Unassigned";
			byDepartment.put(dept, byDepartment.getOrDefault(dept, 0L) + 1);
		}

		double totalSal = all.stream().filter(e -> e.getSal() != null).mapToDouble(Employee::getSal).sum();
		double avgSal = total > 0 ? totalSal / total : 0;

		Map<String, Object> stats = new HashMap<>();
		stats.put("totalEmployees", total);
		stats.put("activeEmployees", active);
		stats.put("onLeaveEmployees", onLeave);
		stats.put("departmentsCount", byDepartment.size());
		stats.put("departmentDistribution", byDepartment);
		stats.put("totalPayrollEstimate", totalSal);
		stats.put("averageSalary", avgSal);

		return ResponseEntity.ok(stats);
	}
}