package com.expense.tracker.backend.service;

import com.expense.tracker.backend.dto.ExpenseDTO;
import com.expense.tracker.backend.entity.*;
import com.expense.tracker.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final BudgetCategoryRepository budgetCategoryRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<ExpenseDTO> getExpenses() {
        return expenseRepository.findByUser(getCurrentUser()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseDTO addExpense(ExpenseDTO expenseDTO) {
        User user = getCurrentUser();
        Category category = categoryRepository.findById(expenseDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized category");
        }

        // For a new expense, existing spent = full sum, new addition = expenseDTO.getAmount()
        validateGovernmentMode(user, category, expenseDTO.getExpenseDate(), 0.0, expenseDTO.getAmount());

        Expense expense = Expense.builder()
                .user(user)
                .category(category)
                .title(expenseDTO.getTitle())
                .amount(expenseDTO.getAmount())
                .expenseDate(expenseDTO.getExpenseDate())
                .notes(expenseDTO.getNotes())
                .build();

        return convertToDTO(expenseRepository.save(expense));
    }

    /**
     * Validates Government Mode budget constraint.
     *
     * @param existingAmount the amount of the expense being replaced (0 for new expenses)
     * @param newAmount      the new amount being added/set
     */
    private void validateGovernmentMode(User user, Category category, LocalDate date,
                                        double existingAmount, double newAmount) {
        int month = date.getMonthValue();
        int year = date.getYear();

        budgetRepository.findByUserAndMonthAndYear(user, month, year).ifPresent(budget -> {
            if (budget.isGovernmentModeEnabled()) {
                budgetCategoryRepository.findByBudgetAndCategory(budget, category).ifPresent(bc -> {
                    LocalDate startOfMonth = date.withDayOfMonth(1);
                    LocalDate endOfMonth = date.withDayOfMonth(date.lengthOfMonth());

                    Double totalSpentSoFar = expenseRepository.sumAmountByUserAndCategoryAndDateBetween(
                            user, category, startOfMonth, endOfMonth);
                    if (totalSpentSoFar == null) totalSpentSoFar = 0.0;

                    // Subtract existing amount to avoid double-counting when updating
                    double spentExcludingCurrent = totalSpentSoFar - existingAmount;

                    if (spentExcludingCurrent + newAmount > bc.getAllocatedAmount()) {
                        throw new RuntimeException("Government Mode: Category budget exceeded.");
                    }
                });
            }
        });
    }

    @Transactional
    public ExpenseDTO updateExpense(Long id, ExpenseDTO expenseDTO) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        User currentUser = getCurrentUser();
        if (!expense.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        Category category = categoryRepository.findById(expenseDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Pass existing amount so the validation doesn't double-count it
        validateGovernmentMode(currentUser, category, expenseDTO.getExpenseDate(),
                expense.getAmount(), expenseDTO.getAmount());

        expense.setTitle(expenseDTO.getTitle());
        expense.setAmount(expenseDTO.getAmount());
        expense.setCategory(category);
        expense.setExpenseDate(expenseDTO.getExpenseDate());
        expense.setNotes(expenseDTO.getNotes());

        return convertToDTO(expenseRepository.save(expense));
    }

    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }
        expenseRepository.delete(expense);
    }

    private ExpenseDTO convertToDTO(Expense expense) {
        return ExpenseDTO.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .categoryId(expense.getCategory().getId())
                .categoryName(expense.getCategory().getName())
                .categoryIcon(expense.getCategory().getIcon())
                .categoryColor(expense.getCategory().getColor())
                .expenseDate(expense.getExpenseDate())
                .notes(expense.getNotes())
                .build();
    }
}