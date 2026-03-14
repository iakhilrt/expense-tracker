package com.expense.tracker.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final java.util.Set<String> BAD_REQUEST_MESSAGES = java.util.Set.of(
            "OTP expired",
            "Invalid OTP",
            "Too many invalid attempts. Request a new OTP.",
            "OTP not requested or expired",
            "Government Mode: Category budget exceeded.",
            "Total category allocations cannot exceed total budget amount",
            "Unauthorized",
            "Unauthorized category"
    );

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {

        String message = ex.getMessage();
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (message != null && BAD_REQUEST_MESSAGES.contains(message)) {
            status = HttpStatus.BAD_REQUEST;
        } else if (message != null && message.contains("not found")) {
            status = HttpStatus.NOT_FOUND;
        } else if (message != null && message.equals("Unauthorized")) {
            status = HttpStatus.FORBIDDEN;
        }

        Map<String, Object> body = new HashMap<>();
        body.put("status", "error");
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now());

        if (status == HttpStatus.INTERNAL_SERVER_ERROR) {
            ex.printStackTrace();
        }

        return new ResponseEntity<>(body, status);
    }

    // Validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");

        Map<String, Object> body = new HashMap<>();
        body.put("status", "error");
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now());

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // DATABASE CONSTRAINT ERRORS
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("status", "error");
        body.put("message", "Category cannot be deleted because it is used in budgets or expenses.");
        body.put("timestamp", LocalDateTime.now());

        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    // Generic fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("status", "error");
        body.put("message", "An unexpected error occurred");
        body.put("timestamp", LocalDateTime.now());

        ex.printStackTrace();

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}