package com.ecommerce.mini.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for product response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private String id;
    private String slug;
    private String title;
    private String description;
    private Integer price;  // Price in cents
    private String imageUrl;
    private Integer stock;
    private Double rating;
    private String[] tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
