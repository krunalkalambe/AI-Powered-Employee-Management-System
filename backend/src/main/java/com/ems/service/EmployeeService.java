package com.ems.service;

import java.util.List;
import org.springframework.http.ResponseEntity;
import com.ems.entity.Employee;

public interface EmployeeService {

	Employee AddData(Employee employee);

	ResponseEntity<?> UpdateData(Employee employee);

	Employee getData(String email);

	ResponseEntity<?> deleteData(String email);

	List<Employee> getAllEmployees();

	Employee getEmployeeById(Long id);

	ResponseEntity<?> deleteEmployeeById(Long id);

	List<Employee> searchEmployees(String query);
}