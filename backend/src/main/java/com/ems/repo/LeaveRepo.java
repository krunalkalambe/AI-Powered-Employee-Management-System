package com.ems.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.entity.LeaveRequest;

@Repository
public interface LeaveRepo extends JpaRepository<LeaveRequest, Long> {

	List<LeaveRequest> findByEmployeeEmailOrderByAppliedDateDesc(String employeeEmail);

	List<LeaveRequest> findByStatus(String status);

	List<LeaveRequest> findByDepartment(String department);

	List<LeaveRequest> findAllByOrderByAppliedDateDesc();

	long countByStatus(String status);

	long countByEmployeeEmailAndStatus(String employeeEmail, String status);
}
