package com.ems.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.entity.Employee;

@Repository
public interface EmployeeRepo extends JpaRepository<Employee, Long> {

	Employee findFirstByEmail(String email);

	default Employee findByEmail(String email) {
		return findFirstByEmail(email);
	}

	Employee findFirstByEmpId(String empId);

	default Employee findByEmpId(String empId) {
		return findFirstByEmpId(empId);
	}

	List<Employee> findByDepartment(String department);

	List<Employee> findByFnameContainingIgnoreCaseOrEmailContainingIgnoreCase(String fname, String email);

	long countByDepartment(String department);
}