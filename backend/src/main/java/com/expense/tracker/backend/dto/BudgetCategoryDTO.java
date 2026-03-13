package com.expense.tracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetCategoryDTO {
    private Long categoryId;
    private String categoryName;
    private double allocatedAmount;
}
