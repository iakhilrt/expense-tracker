package com.expense.tracker.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    // RestTemplate must be declared as a @Bean — see AppConfig.java
    private final RestTemplate restTemplate;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${app.brevo.api-key}")
    private String brevoApiKey;

    public void sendOtpEmail(String to, String otp) {
        String url = "https://api.brevo.com/v3/smtp/email";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("sender", Map.of("name", "Vault", "email", fromEmail));
        body.put("to", List.of(Map.of("email", to)));
        body.put("subject", "Your Vault Login Code");
        body.put("htmlContent",
                "<html><body style='font-family:sans-serif;'>" +
                        "<h2>Your login code</h2>" +
                        "<p style='font-size:32px;letter-spacing:8px;font-weight:bold;'>" + otp + "</p>" +
                        "<p>This code expires in 5 minutes. Do not share it with anyone.</p>" +
                        "</body></html>");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, entity, String.class);
        } catch (HttpStatusCodeException e) {
            System.err.println("Brevo API Error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString());
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        } catch (Exception e) {
            System.err.println("Failed to send email via Brevo: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        }
    }
}