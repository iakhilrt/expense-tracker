package com.expense.tracker.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseDTO {
    private Long id;
    
    @NotBlank
    private String title;
    
    @NotNull
    @Positive
    private double amount;
    
    @NotNull
    private Long categoryId;
    
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    
    @NotNull
    private LocalDate expenseDate;
    
    private String notes;
}
