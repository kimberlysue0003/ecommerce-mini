package com.ecommerce.mini.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for AI search request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AISearchRequest {

    @NotBlank(message = "Search query is required")
    private String query;
}
