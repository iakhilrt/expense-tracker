package com.expense.tracker.backend.service;

import com.expense.tracker.backend.dto.CategoryDTO;
import com.expense.tracker.backend.entity.Category;
import com.expense.tracker.backend.entity.User;
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
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<CategoryDTO> getCategories() {
        return categoryRepository.findByUser(getCurrentUser()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = Category.builder()
                .user(getCurrentUser())
                .name(categoryDTO.getName())
                .icon(categoryDTO.getIcon())
                .color(categoryDTO.getColor())
                .build();
        return convertToDTO(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        User currentUser = getCurrentUser();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Compare by ID to avoid broken entity equality across separate Hibernate sessions
        if (!category.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        category.setName(categoryDTO.getName());
        category.setIcon(categoryDTO.getIcon());
        category.setColor(categoryDTO.getColor());
        return convertToDTO(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        User currentUser = getCurrentUser();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        categoryRepository.delete(category);
    }

    private CategoryDTO convertToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .build();
    }
}