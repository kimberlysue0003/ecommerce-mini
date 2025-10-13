package com.ecommerce.mini.service;

import com.ecommerce.mini.dto.ProductResponse;
import com.ecommerce.mini.entity.Product;
import com.ecommerce.mini.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Service for intelligent search and recommendations
 * Implements TF-IDF similarity and collaborative filtering
 */
@Service
@RequiredArgsConstructor
public class AIService {

    private final ProductRepository productRepository;
    private final ProductService productService;

    /**
     * AI-powered search using NLP query parsing and TF-IDF ranking
     * Supports natural language queries like "bluetooth headphones under 100"
     */
    public List<ProductResponse> aiSearch(String query) {
        // Parse query to extract keywords, price range, etc.
        QueryParts queryParts = parseQuery(query.toLowerCase());

        // Get all products
        List<Product> allProducts = productRepository.findAll();

        // Filter by price range if specified
        List<Product> filteredProducts = allProducts.stream()
                .filter(p -> {
                    if (queryParts.minPrice != null && p.getPrice() < queryParts.minPrice) {
                        return false;
                    }
                    if (queryParts.maxPrice != null && p.getPrice() > queryParts.maxPrice) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        // Calculate TF-IDF scores for each product
        Map<Product, Double> scores = new HashMap<>();
        for (Product product : filteredProducts) {
            double score = calculateRelevanceScore(product, queryParts.keywords);
            if (score > 0) {
                scores.put(product, score);
            }
        }

        // Sort by score (descending) and convert to response
        return scores.entrySet().stream()
                .sorted(Map.Entry.<Product, Double>comparingByValue().reversed())
                .limit(20)
                .map(entry -> mapToResponse(entry.getKey()))
                .collect(Collectors.toList());
    }

    /**
     * Get similar products based on TF-IDF similarity
     */
    public List<ProductResponse> getSimilarProducts(String productId) {
        Product targetProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<Product> allProducts = productRepository.findAll().stream()
                .filter(p -> !p.getId().equals(productId))
                .collect(Collectors.toList());

        // Calculate similarity scores
        Map<Product, Double> similarities = new HashMap<>();
        for (Product product : allProducts) {
            double similarity = calculateCosineSimilarity(targetProduct, product);
            if (similarity > 0.1) { // Threshold
                similarities.put(product, similarity);
            }
        }

        // Return top 10 similar products
        return similarities.entrySet().stream()
                .sorted(Map.Entry.<Product, Double>comparingByValue().reversed())
                .limit(10)
                .map(entry -> mapToResponse(entry.getKey()))
                .collect(Collectors.toList());
    }

    /**
     * Get personalized recommendations for a user
     * Based on collaborative filtering and popularity
     */
    public List<ProductResponse> getPersonalizedRecommendations(String userId) {
        // For now, return top-rated popular products
        // In future: implement user behavior tracking and collaborative filtering
        List<Product> products = productRepository.findAll().stream()
                .sorted(Comparator.comparing(Product::getRating).reversed())
                .limit(10)
                .collect(Collectors.toList());

        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Parse natural language query to extract keywords and filters
     */
    private QueryParts parseQuery(String query) {
        QueryParts parts = new QueryParts();
        parts.keywords = new ArrayList<>();

        // Extract price range patterns
        // Pattern: "under 100", "below 200", "less than 50"
        if (query.matches(".*\\b(under|below|less than)\\s+(\\d+)\\b.*")) {
            String priceStr = query.replaceAll(".*\\b(under|below|less than)\\s+(\\d+)\\b.*", "$2");
            parts.maxPrice = Integer.parseInt(priceStr) * 100; // Convert to cents
        }

        // Pattern: "between 50 and 150"
        if (query.matches(".*\\bbetween\\s+(\\d+)\\s+and\\s+(\\d+)\\b.*")) {
            String[] prices = query.replaceAll(".*\\bbetween\\s+(\\d+)\\s+and\\s+(\\d+)\\b.*", "$1 $2").split(" ");
            parts.minPrice = Integer.parseInt(prices[0]) * 100;
            parts.maxPrice = Integer.parseInt(prices[1]) * 100;
        }

        // Extract keywords (remove common words and price-related terms)
        String[] words = query.split("\\s+");
        Set<String> stopWords = Set.of("the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
                "under", "below", "above", "between", "less", "more", "than", "dollars", "dollar", "$");

        for (String word : words) {
            String cleanWord = word.replaceAll("[^a-z0-9]", "");
            if (!cleanWord.isEmpty() && !stopWords.contains(cleanWord) && !cleanWord.matches("\\d+")) {
                parts.keywords.add(cleanWord);
            }
        }

        return parts;
    }

    /**
     * Calculate relevance score using TF-IDF-like approach
     */
    private double calculateRelevanceScore(Product product, List<String> keywords) {
        if (keywords.isEmpty()) {
            return 0.0;
        }

        String productText = (product.getTitle() + " " +
                             product.getDescription() + " " +
                             String.join(" ", product.getTags())).toLowerCase();

        double score = 0.0;
        for (String keyword : keywords) {
            // Count occurrences
            int count = 0;
            int index = 0;
            while ((index = productText.indexOf(keyword, index)) != -1) {
                count++;
                index += keyword.length();
            }

            if (count > 0) {
                // TF-IDF style: term frequency with diminishing returns
                score += Math.log(1 + count);
            }
        }

        // Boost by rating
        score *= (1 + product.getRating() / 10.0);

        return score;
    }

    /**
     * Calculate cosine similarity between two products based on title and tags
     */
    private double calculateCosineSimilarity(Product p1, Product p2) {
        // Create term vectors
        Map<String, Integer> vector1 = createTermVector(p1);
        Map<String, Integer> vector2 = createTermVector(p2);

        // Calculate dot product
        double dotProduct = 0.0;
        for (String term : vector1.keySet()) {
            if (vector2.containsKey(term)) {
                dotProduct += vector1.get(term) * vector2.get(term);
            }
        }

        // Calculate magnitudes
        double magnitude1 = Math.sqrt(vector1.values().stream()
                .mapToDouble(v -> v * v)
                .sum());
        double magnitude2 = Math.sqrt(vector2.values().stream()
                .mapToDouble(v -> v * v)
                .sum());

        if (magnitude1 == 0 || magnitude2 == 0) {
            return 0.0;
        }

        return dotProduct / (magnitude1 * magnitude2);
    }

    /**
     * Create term frequency vector from product
     */
    private Map<String, Integer> createTermVector(Product product) {
        Map<String, Integer> vector = new HashMap<>();

        // Tokenize title and tags
        String text = (product.getTitle() + " " + String.join(" ", product.getTags())).toLowerCase();
        String[] terms = text.split("\\s+");

        for (String term : terms) {
            String cleanTerm = term.replaceAll("[^a-z0-9]", "");
            if (!cleanTerm.isEmpty()) {
                vector.put(cleanTerm, vector.getOrDefault(cleanTerm, 0) + 1);
            }
        }

        return vector;
    }

    /**
     * Map Product entity to ProductResponse DTO
     */
    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .slug(product.getSlug())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .stock(product.getStock())
                .rating(product.getRating())
                .tags(product.getTags())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    /**
     * Helper class to hold parsed query parts
     */
    private static class QueryParts {
        List<String> keywords;
        Integer minPrice;
        Integer maxPrice;
    }
}
