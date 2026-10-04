package com.ems.repo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.entity.Attendance;

@Repository
public interface AttendanceRepo extends JpaRepository<Attendance, Long> {

	List<Attendance> findByDate(LocalDate date);

	List<Attendance> findByEmployeeEmail(String employeeEmail);

	Optional<Attendance> findByEmployeeEmailAndDate(String employeeEmail, LocalDate date);

	List<Attendance> findByEmployeeEmailOrderByDateDesc(String employeeEmail);

	List<Attendance> findByDateBetween(LocalDate start, LocalDate end);

	long countByDateAndStatus(LocalDate date, String status);
	
	long countByEmployeeEmailAndStatus(String employeeEmail, String status);
	
	long countByEmployeeEmail(String employeeEmail);
}
