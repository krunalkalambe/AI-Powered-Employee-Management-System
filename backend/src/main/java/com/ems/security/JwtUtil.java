package com.ems.security;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

	private static final String SECRET_KEY = "EMS_SUPER_SECURE_JWT_SECRET_KEY_FOR_FINAL_YEAR_PROJECT_2026";
	private static final long EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours

	public String generateToken(String email, String role, String name, String employeeId) {
		try {
			// Header
			String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
			String encodedHeader = Base64.getUrlEncoder().withoutPadding()
					.encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));

			// Payload
			long now = System.currentTimeMillis();
			long exp = now + EXPIRATION_TIME_MS;
			String safeEmail = escapeJson(email);
			String safeRole = escapeJson(role);
			String safeName = escapeJson(name != null ? name : "");
			String safeEmpId = escapeJson(employeeId != null ? employeeId : "");

			String payloadJson = "{"
					+ "\"sub\":\"" + safeEmail + "\","
					+ "\"email\":\"" + safeEmail + "\","
					+ "\"role\":\"" + safeRole + "\","
					+ "\"name\":\"" + safeName + "\","
					+ "\"employeeId\":\"" + safeEmpId + "\","
					+ "\"iat\":" + (now / 1000) + ","
					+ "\"exp\":" + (exp / 1000)
					+ "}";

			String encodedPayload = Base64.getUrlEncoder().withoutPadding()
					.encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

			// Signature
			String signature = hmacSha256(encodedHeader + "." + encodedPayload, SECRET_KEY);

			return encodedHeader + "." + encodedPayload + "." + signature;
		} catch (Exception e) {
			throw new RuntimeException("Error generating JWT token", e);
		}
	}

	public Map<String, Object> validateAndExtractClaims(String token) {
		try {
			if (token == null) return null;
			if (token.startsWith("Bearer ")) {
				token = token.substring(7).trim();
			}

			String[] parts = token.split("\\.");
			if (parts.length != 3) {
				return null;
			}

			String content = parts[0] + "." + parts[1];
			String expectedSignature = hmacSha256(content, SECRET_KEY);
			if (!expectedSignature.equals(parts[2])) {
				return null; // Invalid signature
			}

			byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
			String json = new String(payloadBytes, StandardCharsets.UTF_8);

			Map<String, Object> claims = parseSimpleJson(json);

			// Check expiration
			if (claims.containsKey("exp")) {
				long expSeconds = Long.parseLong(claims.get("exp").toString());
				long nowSeconds = System.currentTimeMillis() / 1000;
				if (nowSeconds > expSeconds) {
					return null; // Expired
				}
			}

			return claims;
		} catch (Exception e) {
			return null;
		}
	}

	public String getEmailFromToken(String token) {
		Map<String, Object> claims = validateAndExtractClaims(token);
		return claims != null ? (String) claims.get("email") : null;
	}

	public String getRoleFromToken(String token) {
		Map<String, Object> claims = validateAndExtractClaims(token);
		return claims != null ? (String) claims.get("role") : null;
	}

	private static String hmacSha256(String data, String key) throws Exception {
		Mac sha256Hmac = Mac.getInstance("HmacSHA256");
		SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
		sha256Hmac.init(secretKey);
		byte[] signedBytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
		return Base64.getUrlEncoder().withoutPadding().encodeToString(signedBytes);
	}

	private static String escapeJson(String s) {
		if (s == null) return "";
		return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
	}

	private static Map<String, Object> parseSimpleJson(String json) {
		Map<String, Object> map = new HashMap<>();
		String trimmed = json.trim();
		if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
			trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
		}
		// Split top-level commas
		String[] pairs = trimmed.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
		for (String pair : pairs) {
			String[] kv = pair.split(":", 2);
			if (kv.length == 2) {
				String key = kv[0].trim().replace("\"", "");
				String val = kv[1].trim();
				if (val.startsWith("\"") && val.endsWith("\"")) {
					val = val.substring(1, val.length() - 1);
					map.put(key, val);
				} else {
					map.put(key, val);
				}
			}
		}
		return map;
	}
}
