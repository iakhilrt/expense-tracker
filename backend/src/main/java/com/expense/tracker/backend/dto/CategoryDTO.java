package com.expense.tracker.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {
    private Long id;
    
    @NotBlank
    private String name;
    
    @NotBlank
    private String icon;
    
    @NotBlank
    private String color;
}
