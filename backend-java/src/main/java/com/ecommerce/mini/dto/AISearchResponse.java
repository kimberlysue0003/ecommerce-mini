package com.ecommerce.mini.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for AI search response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AISearchResponse {

    private List<ProductResponse> results;
    private String query;
    private int count;
}
