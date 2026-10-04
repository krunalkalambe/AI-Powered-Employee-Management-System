package com.ems.repo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.entity.Payroll;

@Repository
public interface PayrollRepo extends JpaRepository<Payroll, Long> {

	List<Payroll> findByEmployeeEmailOrderByYearDescMonthDesc(String employeeEmail);

	List<Payroll> findByMonthAndYear(String month, Integer year);

	Optional<Payroll> findByEmployeeIdAndMonthAndYear(String employeeId, String month, Integer year);

	List<Payroll> findByDepartment(String department);

	List<Payroll> findAllByOrderByYearDescMonthDesc();
}
