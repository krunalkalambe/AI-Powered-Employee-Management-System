package com.ems.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.entity.Department;

@Repository
public interface DepartmentRepo extends JpaRepository<Department, Long> {

	Optional<Department> findByName(String name);

	boolean existsByName(String name);
}
