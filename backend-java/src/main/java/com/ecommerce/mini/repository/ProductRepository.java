package com.ecommerce.mini.repository;

import com.ecommerce.mini.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Product entity
 * Provides database operations for products
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    /**
     * Find all products ordered by creation date (newest first)
     */
    List<Product> findAllByOrderByCreatedAtDesc();

    /**
     * Search products by title or description (case-insensitive)
     * @param keyword search keyword
     * @return list of matching products
     */
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);
}
