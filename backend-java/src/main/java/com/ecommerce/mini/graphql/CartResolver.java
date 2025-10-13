package com.ecommerce.mini.graphql;

import com.ecommerce.mini.dto.AddToCartRequest;
import com.ecommerce.mini.dto.CartItemResponse;
import com.ecommerce.mini.dto.UpdateCartItemRequest;
import com.ecommerce.mini.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

/**
 * GraphQL Resolver for Cart operations
 */
@Controller
@RequiredArgsConstructor
public class CartResolver {

    private final CartService cartService;

    @QueryMapping
    public List<CartItemResponse> cart() {
        String userId = getCurrentUserId();
        return cartService.getCartItems(userId);
    }

    @MutationMapping
    public CartItemResponse addToCart(@Argument Map<String, Object> input) {
        String userId = getCurrentUserId();

        AddToCartRequest request = new AddToCartRequest();
        request.setProductId((String) input.get("productId"));
        request.setQuantity((Integer) input.get("quantity"));

        return cartService.addToCart(userId, request);
    }

    @MutationMapping
    public CartItemResponse updateCartItem(
            @Argument String itemId,
            @Argument Map<String, Object> input) {

        String userId = getCurrentUserId();

        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setQuantity((Integer) input.get("quantity"));

        return cartService.updateCartItem(userId, itemId, request);
    }

    @MutationMapping
    public Boolean removeFromCart(@Argument String itemId) {
        String userId = getCurrentUserId();
        cartService.removeFromCart(userId, itemId);
        return true;
    }

    @MutationMapping
    public Boolean clearCart() {
        String userId = getCurrentUserId();
        cartService.clearCart(userId);
        return true;
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        // In a real scenario, you'd extract the user ID from the JWT token
        // For now, we'll use the email as identifier
        return authentication.getName();
    }
}
