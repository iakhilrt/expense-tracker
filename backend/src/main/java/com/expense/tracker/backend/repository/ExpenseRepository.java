package com.expense.tracker.backend.repository;

import com.expense.tracker.backend.entity.Expense;
import com.expense.tracker.backend.entity.User;
import com.expense.tracker.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUser(User user);
    List<Expense> findByUserAndExpenseDateBetween(User user, LocalDate start, LocalDate end);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.category = :category AND e.expenseDate BETWEEN :start AND :end")
    Double sumAmountByUserAndCategoryAndDateBetween(@Param("user") User user, @Param("category") Category category, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
