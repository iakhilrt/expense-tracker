package com.expense.tracker.backend.controller;

import com.expense.tracker.backend.dto.ExpenseDTO;
import com.expense.tracker.backend.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getExpenses() {
        return ResponseEntity.ok(expenseService.getExpenses());
    }

    @PostMapping
    public ResponseEntity<ExpenseDTO> addExpense(@Valid @RequestBody ExpenseDTO expenseDTO) {
        return ResponseEntity.ok(expenseService.addExpense(expenseDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseDTO expenseDTO) {
        return ResponseEntity.ok(expenseService.updateExpense(id, expenseDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
