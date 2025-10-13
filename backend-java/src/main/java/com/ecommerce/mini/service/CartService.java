package com.ecommerce.mini.service;

import com.ecommerce.mini.dto.AddToCartRequest;
import com.ecommerce.mini.dto.CartItemResponse;
import com.ecommerce.mini.dto.ProductResponse;
import com.ecommerce.mini.dto.UpdateCartItemRequest;
import com.ecommerce.mini.entity.CartItem;
import com.ecommerce.mini.entity.Product;
import com.ecommerce.mini.entity.User;
import com.ecommerce.mini.repository.CartItemRepository;
import com.ecommerce.mini.repository.ProductRepository;
import com.ecommerce.mini.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for cart management operations
 */
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Get all cart items for a user
     */
    public List<CartItemResponse> getCartItems(String userId) {
        return cartItemRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Add item to cart
     */
    @Transactional
    public CartItemResponse addToCart(String userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if item already exists in cart
        var existingItem = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId());

        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Update quantity
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            cartItem.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new cart item
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        }

        CartItem savedItem = cartItemRepository.save(cartItem);
        return mapToResponse(savedItem);
    }

    /**
     * Update cart item quantity
     */
    @Transactional
    public CartItemResponse updateCartItem(String userId, String cartItemId, UpdateCartItemRequest request) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify ownership
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItem.setUpdatedAt(LocalDateTime.now());

        CartItem updatedItem = cartItemRepository.save(cartItem);
        return mapToResponse(updatedItem);
    }

    /**
     * Remove item from cart
     */
    @Transactional
    public void removeFromCart(String userId, String cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify ownership
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        cartItemRepository.delete(cartItem);
    }

    /**
     * Clear all items from cart
     */
    @Transactional
    public void clearCart(String userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    /**
     * Map CartItem entity to CartItemResponse DTO
     */
    private CartItemResponse mapToResponse(CartItem cartItem) {
        Product product = cartItem.getProduct();
        BigDecimal subtotal = BigDecimal.valueOf(product.getPrice()).multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        ProductResponse productResponse = ProductResponse.builder()
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

        return CartItemResponse.builder()
                .id(cartItem.getId())
                .product(productResponse)
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
