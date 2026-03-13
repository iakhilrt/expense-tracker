package com.expense.tracker.backend.service;

import com.expense.tracker.backend.dto.BudgetCategoryDTO;
import com.expense.tracker.backend.dto.BudgetDTO;
import com.expense.tracker.backend.entity.Budget;
import com.expense.tracker.backend.entity.BudgetCategory;
import com.expense.tracker.backend.entity.Category;
import com.expense.tracker.backend.entity.User;
import com.expense.tracker.backend.repository.BudgetCategoryRepository;
import com.expense.tracker.backend.repository.BudgetRepository;
import com.expense.tracker.backend.repository.CategoryRepository;
import com.expense.tracker.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final BudgetCategoryRepository budgetCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public BudgetDTO getCurrentBudget(int month, int year) {
        Budget budget = budgetRepository.findByUserAndMonthAndYear(getCurrentUser(), month, year)
                .orElseThrow(() -> new RuntimeException("Budget not found for " + month + "/" + year));
        return convertToDTO(budget);
    }

    public List<BudgetDTO> getBudgetHistory() {
        return budgetRepository.findByUserOrderByYearDescMonthDesc(getCurrentUser()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetDTO createOrUpdateBudget(BudgetDTO budgetDTO) {
        User user = getCurrentUser();
        Budget budget = budgetRepository.findByUserAndMonthAndYear(user, budgetDTO.getMonth(), budgetDTO.getYear())
                .orElse(Budget.builder()
                        .user(user)
                        .month(budgetDTO.getMonth())
                        .year(budgetDTO.getYear())
                        .categoryAllocations(new java.util.ArrayList<>())
                        .build());

        budget.setTotalAmount(budgetDTO.getTotalAmount());
        budget.setGovernmentModeEnabled(budgetDTO.isGovernmentModeEnabled());

        // Validate that sum of allocations equals total budget
        double sumAllocations = budgetDTO.getCategoryAllocations().stream()
                .mapToDouble(BudgetCategoryDTO::getAllocatedAmount)
                .sum();

        if (sumAllocations > budgetDTO.getTotalAmount()) {
            throw new RuntimeException("Total category allocations cannot exceed total budget amount");
        }

        Budget savedBudget = budgetRepository.save(budget);

        // Update category allocations
        if (savedBudget.getCategoryAllocations() == null) { savedBudget.setCategoryAllocations(new java.util.ArrayList<>()); } else { savedBudget.getCategoryAllocations().clear(); }
        for (BudgetCategoryDTO allocationDTO : budgetDTO.getCategoryAllocations()) {
            Category category = categoryRepository.findById(allocationDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            BudgetCategory allocation = BudgetCategory.builder()
                    .budget(savedBudget)
                    .category(category)
                    .allocatedAmount(allocationDTO.getAllocatedAmount())
                    .build();
            savedBudget.getCategoryAllocations().add(allocation);
        }

        return convertToDTO(budgetRepository.save(savedBudget));
    }

    private BudgetDTO convertToDTO(Budget budget) {
        List<BudgetCategoryDTO> allocations = budget.getCategoryAllocations().stream()
                .map(bc -> BudgetCategoryDTO.builder()
                        .categoryId(bc.getCategory().getId())
                        .categoryName(bc.getCategory().getName())
                        .allocatedAmount(bc.getAllocatedAmount())
                        .build())
                .collect(Collectors.toList());

        return BudgetDTO.builder()
                .id(budget.getId())
                .month(budget.getMonth())
                .year(budget.getYear())
                .totalAmount(budget.getTotalAmount())
                .governmentModeEnabled(budget.isGovernmentModeEnabled())
                .categoryAllocations(allocations)
                .build();
    }
}