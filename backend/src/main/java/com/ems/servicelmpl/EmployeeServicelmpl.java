package com.ems.servicelmpl;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ems.entity.Employee;
import com.ems.repo.EmployeeRepo;
import com.ems.service.EmployeeService;

@Service
public class EmployeeServicelmpl implements EmployeeService {

	@Autowired
	private EmployeeRepo employeeRepo;

	@Override
	public Employee AddData(Employee employee) {
		if (employee.getEmail() != null) {
			Employee existing = employeeRepo.findByEmail(employee.getEmail().trim().toLowerCase());
			if (existing != null) {
				employee.setId(existing.getId());
				if (existing.getEmpId() != null) {
					employee.setEmpId(existing.getEmpId());
				}
			}
		}

		if (employee.getEmpId() == null || employee.getEmpId().trim().isEmpty()) {
			long count = employeeRepo.count() + 1;
			employee.setEmpId(String.format("EMP-%04d", count));
		}
		if (employee.getStatus() == null || employee.getStatus().trim().isEmpty()) {
			employee.setStatus("ACTIVE");
		}
		if (employee.getRole() == null || employee.getRole().trim().isEmpty()) {
			employee.setRole("EMPLOYEE");
		}
		if (employee.getDepartment() == null || employee.getDepartment().trim().isEmpty()) {
			employee.setDepartment("Engineering");
		}
		return employeeRepo.save(employee);
	}

	@Override
	public ResponseEntity<?> UpdateData(Employee employee) {
		Employee existing = null;
		if (employee.getId() != null) {
			existing = employeeRepo.findById(employee.getId()).orElse(null);
		}
		if (existing == null && employee.getEmail() != null) {
			existing = employeeRepo.findByEmail(employee.getEmail().trim().toLowerCase());
		}

		if (existing == null) {
			return ResponseEntity.badRequest().body("Employee Data not Found");
		}

		// Update fields while preserving ID and empId if not provided
		if (employee.getEmpId() != null && !employee.getEmpId().isEmpty()) {
			existing.setEmpId(employee.getEmpId());
		}
		if (employee.getFname() != null) existing.setFname(employee.getFname());
		if (employee.getEmail() != null) existing.setEmail(employee.getEmail().trim().toLowerCase());
		if (employee.getDob() != null) existing.setDob(employee.getDob());
		if (employee.getAddress() != null) existing.setAddress(employee.getAddress());
		if (employee.getJdate() != null) existing.setJdate(employee.getJdate());
		if (employee.getSal() != null) existing.setSal(employee.getSal());
		if (employee.getDesig() != null) existing.setDesig(employee.getDesig());
		if (employee.getInc() != null) existing.setInc(employee.getInc());
		if (employee.getBloodgrp() != null) existing.setBloodgrp(employee.getBloodgrp());
		if (employee.getMobile() != null) existing.setMobile(employee.getMobile());
		if (employee.getGender() != null) existing.setGender(employee.getGender());
		if (employee.getDepartment() != null) existing.setDepartment(employee.getDepartment());
		if (employee.getRole() != null) existing.setRole(employee.getRole());
		if (employee.getStatus() != null) existing.setStatus(employee.getStatus());
		if (employee.getSkills() != null) existing.setSkills(employee.getSkills());
		if (employee.getExperienceYears() != null) existing.setExperienceYears(employee.getExperienceYears());
		if (employee.getPerformanceScore() != null) existing.setPerformanceScore(employee.getPerformanceScore());

		Employee saved = employeeRepo.save(existing);
		return ResponseEntity.ok(saved);
	}

	@Override
	public Employee getData(String email) {
		return employeeRepo.findByEmail(email.trim().toLowerCase());
	}

	@Override
	public ResponseEntity<?> deleteData(String email) {
		Employee emp = employeeRepo.findByEmail(email.trim().toLowerCase());
		if (emp == null) {
			return ResponseEntity.badRequest().body("employee data not found");
		}
		employeeRepo.deleteById(emp.getId());
		return ResponseEntity.ok("deleted successfully");
	}

	@Override
	public List<Employee> getAllEmployees() {
		return employeeRepo.findAll();
	}

	@Override
	public Employee getEmployeeById(Long id) {
		return employeeRepo.findById(id).orElse(null);
	}

	@Override
	public ResponseEntity<?> deleteEmployeeById(Long id) {
		Optional<Employee> emp = employeeRepo.findById(id);
		if (emp.isEmpty()) {
			return ResponseEntity.badRequest().body("Employee with ID " + id + " not found");
		}
		employeeRepo.deleteById(id);
		return ResponseEntity.ok("Employee deleted successfully");
	}

	@Override
	public List<Employee> searchEmployees(String query) {
		if (query == null || query.trim().isEmpty()) {
			return employeeRepo.findAll();
		}
		return employeeRepo.findByFnameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
	}
}