package com.expense.tracker.backend.controller;

import com.expense.tracker.backend.dto.BudgetDTO;
import com.expense.tracker.backend.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/current")
    public ResponseEntity<BudgetDTO> getCurrentBudget(@RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(budgetService.getCurrentBudget(month, year));
    }

    @GetMapping("/history")
    public ResponseEntity<List<BudgetDTO>> getBudgetHistory() {
        return ResponseEntity.ok(budgetService.getBudgetHistory());
    }

    @PostMapping
    public ResponseEntity<BudgetDTO> createOrUpdateBudget(@Valid @RequestBody BudgetDTO budgetDTO) {
        return ResponseEntity.ok(budgetService.createOrUpdateBudget(budgetDTO));
    }
}
