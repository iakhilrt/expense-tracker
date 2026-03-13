package com.expense.tracker.backend.repository;

import com.expense.tracker.backend.entity.BudgetCategory;
import com.expense.tracker.backend.entity.Budget;
import com.expense.tracker.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long> {
    Optional<BudgetCategory> findByBudgetAndCategory(Budget budget, Category category);
}
