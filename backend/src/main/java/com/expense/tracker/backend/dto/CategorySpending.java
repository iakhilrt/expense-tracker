package com.expense.tracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySpending {
    private String categoryName;
    private double spent;
    private double allocated;
    private double percentage;
}
