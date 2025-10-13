package com.ecommerce.mini.controller;

import com.ecommerce.mini.dto.AISearchRequest;
import com.ecommerce.mini.dto.AISearchResponse;
import com.ecommerce.mini.dto.ProductResponse;
import com.ecommerce.mini.service.AIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for AI-powered features
 * Provides intelligent search and recommendations
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    /**
     * AI-powered product search
     * POST /api/ai/search
     * Supports natural language queries like:
     * - "bluetooth headphones under 100"
     * - "gaming mouse between 50 and 150"
     * - "best rated keyboards"
     */
    @PostMapping("/search")
    public ResponseEntity<AISearchResponse> aiSearch(@Valid @RequestBody AISearchRequest request) {
        List<ProductResponse> results = aiService.aiSearch(request.getQuery());

        AISearchResponse response = AISearchResponse.builder()
                .results(results)
                .query(request.getQuery())
                .count(results.size())
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Get similar products based on a given product
     * GET /api/ai/recommend/{productId}
     * Uses TF-IDF cosine similarity on title and tags
     */
    @GetMapping("/recommend/{productId}")
    public ResponseEntity<List<ProductResponse>> getSimilarProducts(@PathVariable String productId) {
        List<ProductResponse> recommendations = aiService.getSimilarProducts(productId);
        return ResponseEntity.ok(recommendations);
    }

    /**
     * Get personalized recommendations for the current user
     * GET /api/ai/recommend/user
     * Based on user behavior and collaborative filtering
     */
    @GetMapping("/recommend/user")
    public ResponseEntity<List<ProductResponse>> getPersonalizedRecommendations() {
        // For now, returns popular products
        // In future: use actual user ID from JWT token
        List<ProductResponse> recommendations = aiService.getPersonalizedRecommendations(null);
        return ResponseEntity.ok(recommendations);
    }
}
