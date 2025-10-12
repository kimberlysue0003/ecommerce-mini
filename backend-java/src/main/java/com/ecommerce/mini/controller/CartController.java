package com.ecommerce.mini.controller;

import com.ecommerce.mini.dto.AddToCartRequest;
import com.ecommerce.mini.dto.CartItemResponse;
import com.ecommerce.mini.dto.UpdateCartItemRequest;
import com.ecommerce.mini.entity.User;
import com.ecommerce.mini.repository.UserRepository;
import com.ecommerce.mini.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for cart management
 */
@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    /**
     * Get all cart items for current user
     * GET /api/cart
     */
    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCartItems(Authentication authentication) {
        String userId = getUserIdFromAuth(authentication);
        List<CartItemResponse> cartItems = cartService.getCartItems(userId);
        return ResponseEntity.ok(cartItems);
    }

    /**
     * Add item to cart
     * POST /api/cart
     */
    @PostMapping
    public ResponseEntity<CartItemResponse> addToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequest request) {
        String userId = getUserIdFromAuth(authentication);
        CartItemResponse cartItem = cartService.addToCart(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(cartItem);
    }

    /**
     * Update cart item quantity
     * PUT /api/cart/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CartItemResponse> updateCartItem(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody UpdateCartItemRequest request) {
        String userId = getUserIdFromAuth(authentication);
        CartItemResponse cartItem = cartService.updateCartItem(userId, id, request);
        return ResponseEntity.ok(cartItem);
    }

    /**
     * Remove item from cart
     * DELETE /api/cart/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromCart(
            Authentication authentication,
            @PathVariable String id) {
        String userId = getUserIdFromAuth(authentication);
        cartService.removeFromCart(userId, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Clear all items from cart
     * DELETE /api/cart
     */
    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        String userId = getUserIdFromAuth(authentication);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Extract user ID from authentication
     */
    private String getUserIdFromAuth(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
