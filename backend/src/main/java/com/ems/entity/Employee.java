package com.ems.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "employee")
public class Employee {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(unique = true)
	private String empId;
	
	private String fname;
	
	@Column(unique = true)
	private String email;
	
	private String dob;
	private String address;
	private String jdate;
	private Long sal;
	private String desig;
	private Long inc;
	private String bloodgrp;
	private Long mobile;
	private String gender;
	
	private String department;
	private String role; // ADMIN, HR, MANAGER, EMPLOYEE
	private String status; // ACTIVE, INACTIVE, ON_LEAVE
	private String skills;
	private Double experienceYears;
	private Double performanceScore;

	public Employee() {
	}

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	
	public String getEmpId() {
		return empId;
	}
	public void setEmpId(String empId) {
		this.empId = empId;
	}

	public String getFname() {
		return fname;
	}
	public void setFname(String fname) {
		this.fname = fname;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getDob() {
		return dob;
	}
	public void setDob(String dob) {
		this.dob = dob;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getJdate() {
		return jdate;
	}
	public void setJdate(String jdate) {
		this.jdate = jdate;
	}
	public Long getSal() {
		return sal;
	}
	public void setSal(Long sal) {
		this.sal = sal;
	}
	public String getDesig() {
		return desig;
	}
	public void setDesig(String desig) {
		this.desig = desig;
	}
	public Long getInc() {
		return inc;
	}
	public void setInc(Long inc) {
		this.inc = inc;
	}
	public String getBloodgrp() {
		return bloodgrp;
	}
	public void setBloodgrp(String bloodgrp) {
		this.bloodgrp = bloodgrp;
	}
	public Long getMobile() {
		return mobile;
	}
	public void setMobile(Long mobile) {
		this.mobile = mobile;
	}
	public String getGender() {
		return gender;
	}
	public void setGender(String gender) {
		this.gender = gender;
	}
	
	public String getDepartment() {
		return department;
	}
	public void setDepartment(String department) {
		this.department = department;
	}

	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}

	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}

	public String getSkills() {
		return skills;
	}
	public void setSkills(String skills) {
		this.skills = skills;
	}

	public Double getExperienceYears() {
		return experienceYears;
	}
	public void setExperienceYears(Double experienceYears) {
		this.experienceYears = experienceYears;
	}

	public Double getPerformanceScore() {
		return performanceScore;
	}
	public void setPerformanceScore(Double performanceScore) {
		this.performanceScore = performanceScore;
	}

	@Override
	public String toString() {
		return "Employee [id=" + id + ", empId=" + empId + ", fname=" + fname + ", email=" + email + ", dob=" + dob + ", address=" + address
				+ ", jdate=" + jdate + ", sal=" + sal + ", desig=" + desig + ", inc=" + inc + ", bloodgrp=" + bloodgrp
				+ ", mobile=" + mobile + ", gender=" + gender + ", department=" + department + ", role=" + role + ", status=" + status + "]";
	}
}