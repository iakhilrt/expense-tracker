package com.expense.tracker.backend.repository;

import com.expense.tracker.backend.entity.Budget;
import com.expense.tracker.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUserAndMonthAndYear(User user, int month, int year);
    List<Budget> findByUserOrderByYearDescMonthDesc(User user);
}
