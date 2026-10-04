package com.ems.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class PasswordUtil {

	private static final String SALT = "EMS_SECRET_SALT_2026";

	public static String hashPassword(String plainPassword) {
		if (plainPassword == null) return null;
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			byte[] hash = md.digest((plainPassword + SALT).getBytes(StandardCharsets.UTF_8));
			StringBuilder hexString = new StringBuilder();
			for (byte b : hash) {
				String hex = Integer.toHexString(0xff & b);
				if (hex.length() == 1) hexString.append('0');
				hexString.append(hex);
			}
			return hexString.toString();
		} catch (NoSuchAlgorithmException e) {
			throw new RuntimeException("SHA-256 algorithm not available", e);
		}
	}

	public static boolean verifyPassword(String plainPassword, String storedHash) {
		if (plainPassword == null || storedHash == null) return false;
		String calculatedHash = hashPassword(plainPassword);
		// Support both hashed passwords and legacy plain passwords
		return calculatedHash.equals(storedHash) || plainPassword.equals(storedHash);
	}
}
