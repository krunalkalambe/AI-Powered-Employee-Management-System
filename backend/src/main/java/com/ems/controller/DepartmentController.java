package com.ems.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.repo.DepartmentRepo;
import com.ems.repo.EmployeeRepo;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin("*")
public class DepartmentController {

	@Autowired
	private DepartmentRepo departmentRepo;

	@Autowired
	private EmployeeRepo employeeRepo;

	@GetMapping
	public ResponseEntity<List<Map<String, Object>>> getAllDepartments() {
		List<Department> departments = departmentRepo.findAll();
		List<Map<String, Object>> result = new ArrayList<>();

		for (Department dept : departments) {
			Map<String, Object> map = new HashMap<>();
			map.put("id", dept.getId());
			map.put("name", dept.getName());
			map.put("description", dept.getDescription());
			map.put("managerName", dept.getManagerName());
			map.put("managerEmail", dept.getManagerEmail());
			map.put("location", dept.getLocation());
			map.put("budget", dept.getBudget());
			map.put("createdAt", dept.getCreatedAt());

			long employeeCount = employeeRepo.countByDepartment(dept.getName());
			map.put("employeeCount", employeeCount);

			result.add(map);
		}

		return ResponseEntity.ok(result);
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getDepartmentById(@PathVariable Long id) {
		Optional<Department> deptOpt = departmentRepo.findById(id);
		if (deptOpt.isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		Department dept = deptOpt.get();
		Map<String, Object> map = new HashMap<>();
		map.put("id", dept.getId());
		map.put("name", dept.getName());
		map.put("description", dept.getDescription());
		map.put("managerName", dept.getManagerName());
		map.put("managerEmail", dept.getManagerEmail());
		map.put("location", dept.getLocation());
		map.put("budget", dept.getBudget());
		map.put("employeeCount", employeeRepo.countByDepartment(dept.getName()));
		return ResponseEntity.ok(map);
	}

	@GetMapping("/{id}/employees")
	public ResponseEntity<?> getDepartmentEmployees(@PathVariable Long id) {
		Optional<Department> deptOpt = departmentRepo.findById(id);
		if (deptOpt.isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		List<Employee> emps = employeeRepo.findByDepartment(deptOpt.get().getName());
		return ResponseEntity.ok(emps);
	}

	@PostMapping
	public ResponseEntity<?> createDepartment(@RequestBody Department dept) {
		if (dept.getName() == null || dept.getName().trim().isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("message", "Department name is required"));
		}
		if (departmentRepo.existsByName(dept.getName().trim())) {
			return ResponseEntity.badRequest().body(Map.of("message", "Department with this name already exists"));
		}
		Department saved = departmentRepo.save(dept);
		return ResponseEntity.ok(saved);
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody Department dept) {
		Optional<Department> existingOpt = departmentRepo.findById(id);
		if (existingOpt.isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		Department existing = existingOpt.get();
		if (dept.getName() != null) existing.setName(dept.getName());
		if (dept.getDescription() != null) existing.setDescription(dept.getDescription());
		if (dept.getManagerName() != null) existing.setManagerName(dept.getManagerName());
		if (dept.getManagerEmail() != null) existing.setManagerEmail(dept.getManagerEmail());
		if (dept.getLocation() != null) existing.setLocation(dept.getLocation());
		if (dept.getBudget() != null) existing.setBudget(dept.getBudget());

		Department updated = departmentRepo.save(existing);
		return ResponseEntity.ok(updated);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
		if (!departmentRepo.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		departmentRepo.deleteById(id);
		return ResponseEntity.ok(Map.of("message", "Department deleted successfully"));
	}
}
