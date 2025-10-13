package com.ecommerce.mini.graphql;

import com.ecommerce.mini.dto.ProductResponse;
import com.ecommerce.mini.service.AIService;
import com.ecommerce.mini.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

/**
 * GraphQL Query Resolver
 * Handles all GraphQL queries for the e-commerce API
 */
@Controller
@RequiredArgsConstructor
public class QueryResolver {

    private final ProductService productService;
    private final AIService aiService;

    /**
     * Query all products with optional filters
     */
    @QueryMapping
    public List<ProductResponse> products(
            @Argument String search,
            @Argument Integer limit,
            @Argument Integer offset) {

        if (search != null && !search.isEmpty()) {
            return productService.searchProducts(search);
        }

        return productService.getAllProducts();
    }

    /**
     * Query a single product by ID
     */
    @QueryMapping
    public ProductResponse product(@Argument String id) {
        return productService.getProductById(id);
    }

    /**
     * Query a product by slug
     */
    @QueryMapping
    public ProductResponse productBySlug(@Argument String slug) {
        return productService.getAllProducts().stream()
                .filter(p -> p.getSlug().equals(slug))
                .findFirst()
                .orElse(null);
    }

    /**
     * AI-powered search
     */
    @QueryMapping
    public Map<String, Object> aiSearch(@Argument String query) {
        List<ProductResponse> results = aiService.aiSearch(query);

        return Map.of(
                "results", results,
                "query", query,
                "count", results.size()
        );
    }

    /**
     * Get similar products
     */
    @QueryMapping
    public List<ProductResponse> similarProducts(@Argument String productId) {
        return aiService.getSimilarProducts(productId);
    }

    /**
     * Get personalized recommendations
     */
    @QueryMapping
    public List<ProductResponse> recommendations(@Argument String productId) {
        if (productId != null) {
            return aiService.getSimilarProducts(productId);
        }
        return aiService.getPersonalizedRecommendations(null);
    }
}
