package com.expense.tracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummary {
    private double totalBudget;
    private double totalSpent;
    private double remainingBalance;
    private List<CategorySpending> categoryBreakdown;
    private Map<String, Double> dailyTrend;
}
