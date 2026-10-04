package com.ems.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "payroll")
public class Payroll {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String employeeId;
	private String employeeName;
	private String employeeEmail;
	private String department;
	
	private String month;
	private Integer year;
	
	private Double basicSalary;
	private Double allowance;
	private Double deduction;
	private Double netSalary; // Net = Basic + Allowance - Deduction
	
	private String paymentStatus; // PAID, PENDING
	private LocalDate paymentDate;
	private String notes;

	public Payroll() {
	}

	public Payroll(String employeeId, String employeeName, String employeeEmail, String department, String month, Integer year, Double basicSalary, Double allowance, Double deduction, String paymentStatus) {
		this.employeeId = employeeId;
		this.employeeName = employeeName;
		this.employeeEmail = employeeEmail;
		this.department = department;
		this.month = month;
		this.year = year;
		this.basicSalary = basicSalary != null ? basicSalary : 0.0;
		this.allowance = allowance != null ? allowance : 0.0;
		this.deduction = deduction != null ? deduction : 0.0;
		this.netSalary = this.basicSalary + this.allowance - this.deduction;
		this.paymentStatus = paymentStatus;
		if ("PAID".equalsIgnoreCase(paymentStatus)) {
			this.paymentDate = LocalDate.now();
		}
	}

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}

	public String getEmployeeId() {
		return employeeId;
	}
	public void setEmployeeId(String employeeId) {
		this.employeeId = employeeId;
	}

	public String getEmployeeName() {
		return employeeName;
	}
	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
	}

	public String getEmployeeEmail() {
		return employeeEmail;
	}
	public void setEmployeeEmail(String employeeEmail) {
		this.employeeEmail = employeeEmail;
	}

	public String getDepartment() {
		return department;
	}
	public void setDepartment(String department) {
		this.department = department;
	}

	public String getMonth() {
		return month;
	}
	public void setMonth(String month) {
		this.month = month;
	}

	public Integer getYear() {
		return year;
	}
	public void setYear(Integer year) {
		this.year = year;
	}

	public Double getBasicSalary() {
		return basicSalary;
	}
	public void setBasicSalary(Double basicSalary) {
		this.basicSalary = basicSalary;
		recalculateNet();
	}

	public Double getAllowance() {
		return allowance;
	}
	public void setAllowance(Double allowance) {
		this.allowance = allowance;
		recalculateNet();
	}

	public Double getDeduction() {
		return deduction;
	}
	public void setDeduction(Double deduction) {
		this.deduction = deduction;
		recalculateNet();
	}

	public Double getNetSalary() {
		return netSalary;
	}
	public void setNetSalary(Double netSalary) {
		this.netSalary = netSalary;
	}

	public void recalculateNet() {
		double b = this.basicSalary != null ? this.basicSalary : 0.0;
		double a = this.allowance != null ? this.allowance : 0.0;
		double d = this.deduction != null ? this.deduction : 0.0;
		this.netSalary = b + a - d;
	}

	public String getPaymentStatus() {
		return paymentStatus;
	}
	public void setPaymentStatus(String paymentStatus) {
		this.paymentStatus = paymentStatus;
	}

	public LocalDate getPaymentDate() {
		return paymentDate;
	}
	public void setPaymentDate(LocalDate paymentDate) {
		this.paymentDate = paymentDate;
	}

	public String getNotes() {
		return notes;
	}
	public void setNotes(String notes) {
		this.notes = notes;
	}
}
