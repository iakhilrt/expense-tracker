package com.expense.tracker.backend.service;

import com.expense.tracker.backend.dto.CategorySpending;
import com.expense.tracker.backend.dto.DashboardSummary;
import com.expense.tracker.backend.entity.*;
import com.expense.tracker.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public DashboardSummary getSummary(int month, int year) {
        User user = getCurrentUser();
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());

        Budget budget = budgetRepository.findByUserAndMonthAndYear(user, month, year).orElse(null);
        List<Expense> expenses = expenseRepository.findByUserAndExpenseDateBetween(user, startOfMonth, endOfMonth);

        double totalBudget = budget != null ? budget.getTotalAmount() : 0.0;
        double totalSpent = expenses.stream().mapToDouble(Expense::getAmount).sum();

        List<CategorySpending> breakdown = new ArrayList<>();
        if (budget != null) {
            for (BudgetCategory bc : budget.getCategoryAllocations()) {
                double spent = expenses.stream()
                        .filter(e -> e.getCategory().getId().equals(bc.getCategory().getId()))
                        .mapToDouble(Expense::getAmount).sum();
                
                breakdown.add(CategorySpending.builder()
                        .categoryName(bc.getCategory().getName())
                        .spent(spent)
                        .allocated(bc.getAllocatedAmount())
                        .percentage(bc.getAllocatedAmount() > 0 ? (spent / bc.getAllocatedAmount()) * 100 : 0)
                        .build());
            }
        }

        Map<String, Double> dailyTrend = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getExpenseDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
                        TreeMap::new,
                        Collectors.summingDouble(Expense::getAmount)
                ));

        return DashboardSummary.builder()
                .totalBudget(totalBudget)
                .totalSpent(totalSpent)
                .remainingBalance(totalBudget - totalSpent)
                .categoryBreakdown(breakdown)
                .dailyTrend(dailyTrend)
                .build();
    }
}
