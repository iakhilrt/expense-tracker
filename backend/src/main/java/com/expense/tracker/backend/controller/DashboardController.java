package com.expense.tracker.backend.controller;

import com.expense.tracker.backend.dto.DashboardSummary;
import com.expense.tracker.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary(@RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(dashboardService.getSummary(month, year));
    }
}
