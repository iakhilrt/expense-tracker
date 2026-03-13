package com.expense.tracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetDTO {
    private Long id;
    private int month;
    private int year;
    private double totalAmount;
    private boolean governmentModeEnabled;
    private List<BudgetCategoryDTO> categoryAllocations;
}
