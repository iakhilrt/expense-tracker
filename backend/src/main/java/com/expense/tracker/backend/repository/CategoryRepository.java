package com.expense.tracker.backend.repository;

import com.expense.tracker.backend.entity.Category;
import com.expense.tracker.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUser(User user);
}
