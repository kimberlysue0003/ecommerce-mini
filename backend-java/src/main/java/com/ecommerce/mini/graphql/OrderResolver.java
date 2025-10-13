package com.ecommerce.mini.graphql;

import com.ecommerce.mini.dto.CreateOrderRequest;
import com.ecommerce.mini.dto.OrderResponse;
import com.ecommerce.mini.service.OrderService;
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
 * GraphQL Resolver for Order operations
 */
@Controller
@RequiredArgsConstructor
public class OrderResolver {

    private final OrderService orderService;

    @QueryMapping
    public List<OrderResponse> orders() {
        String userId = getCurrentUserId();
        return orderService.getUserOrders(userId);
    }

    @QueryMapping
    public OrderResponse order(@Argument String id) {
        String userId = getCurrentUserId();
        return orderService.getOrderById(userId, id);
    }

    @MutationMapping
    public OrderResponse createOrder(@Argument Map<String, Object> input) {
        String userId = getCurrentUserId();

        CreateOrderRequest request = new CreateOrderRequest();
        @SuppressWarnings("unchecked")
        List<String> cartItemIds = (List<String>) input.get("cartItemIds");
        request.setCartItemIds(cartItemIds);

        return orderService.createOrder(userId, request);
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return authentication.getName();
    }
}
