package com.expense.tracker.backend.service;

import com.expense.tracker.backend.dto.AuthResponse;
import com.expense.tracker.backend.entity.OTPCode;
import com.expense.tracker.backend.entity.User;
import com.expense.tracker.backend.repository.OTPCodeRepository;
import com.expense.tracker.backend.repository.UserRepository;
import com.expense.tracker.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OTPCodeRepository otpCodeRepository;
    private final EmailService emailService;
    private final JwtUtils jwtUtils;

    private final BCryptPasswordEncoder passwordEncoder; // injected from AppConfig @Bean

    @Value("${app.otp.expiry-minutes}")
    private int otpExpiryMinutes;

    @Value("${app.otp.max-attempts}")
    private int maxAttempts;

    @Value("${app.otp.resend-cooldown-seconds}")
    private int resendCooldownSeconds;

    @Transactional
    public void requestOtp(String email) {
        // Enforce resend cooldown — prevent OTP spam
        Optional<OTPCode> existing = otpCodeRepository.findByEmail(email);
        if (existing.isPresent()) {
            LocalDateTime cooldownEnd = existing.get().getCreatedAt().plusSeconds(resendCooldownSeconds);
            if (LocalDateTime.now().isBefore(cooldownEnd)) {
                long secondsLeft = java.time.Duration.between(LocalDateTime.now(), cooldownEnd).getSeconds();
                throw new RuntimeException("Please wait " + secondsLeft + " seconds before requesting a new OTP.");
            }
        }

        String rawOtp = String.format("%06d", new Random().nextInt(1000000));
        String hashedOtp = passwordEncoder.encode(rawOtp);

        otpCodeRepository.deleteByEmail(email);

        OTPCode otpCode = OTPCode.builder()
                .email(email)
                .otp(hashedOtp)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .attempts(0)
                .build();

        otpCodeRepository.save(otpCode);

        emailService.sendOtpEmail(email, rawOtp);
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        OTPCode otpCode = otpCodeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OTP not requested or expired"));

        if (otpCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpCodeRepository.delete(otpCode);
            throw new RuntimeException("OTP expired");
        }

        if (otpCode.getAttempts() >= maxAttempts) {
            otpCodeRepository.delete(otpCode);
            throw new RuntimeException("Too many invalid attempts. Request a new OTP.");
        }

        // Compare against the hashed OTP stored in DB
        if (!passwordEncoder.matches(otp, otpCode.getOtp())) {
            otpCode.setAttempts(otpCode.getAttempts() + 1);
            otpCodeRepository.save(otpCode);
            throw new RuntimeException("Invalid OTP");
        }

        otpCodeRepository.delete(otpCode);

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .governmentModeEnabled(false)
                    .build();
            return userRepository.save(newUser);
        });

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtils.generateToken(email);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .governmentModeEnabled(user.isGovernmentModeEnabled())
                .build();
    }
}