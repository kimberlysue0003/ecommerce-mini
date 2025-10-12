package com.ecommerce.mini.repository;

import com.ecommerce.mini.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for CartItem entity
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {

    /**
     * Find all cart items for a specific user
     */
    @Query("SELECT c FROM CartItem c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<CartItem> findByUserId(@Param("userId") String userId);

    /**
     * Find specific cart item by user and product
     */
    @Query("SELECT c FROM CartItem c WHERE c.user.id = :userId AND c.product.id = :productId")
    Optional<CartItem> findByUserIdAndProductId(@Param("userId") String userId, @Param("productId") String productId);

    /**
     * Delete all cart items for a user
     */
    void deleteByUserId(String userId);
}
