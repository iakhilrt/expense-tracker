package com.expense.tracker.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpRequest {
    @Email
    @NotBlank
    private String email;
}
