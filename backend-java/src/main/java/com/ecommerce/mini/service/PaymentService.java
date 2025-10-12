package com.ecommerce.mini.service;

import com.ecommerce.mini.dto.PaymentIntentResponse;
import com.ecommerce.mini.entity.Order;
import com.ecommerce.mini.entity.enums.OrderStatus;
import com.ecommerce.mini.repository.OrderRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Service for Stripe payment integration
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    /**
     * Create a Stripe Payment Intent for an order
     */
    @Transactional
    public PaymentIntentResponse createPaymentIntent(String userId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify ownership
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }

        // Check if order already has a payment intent
        if (order.getStripePaymentIntentId() != null) {
            throw new RuntimeException("Order already has a payment intent");
        }

        try {
            // Convert amount to cents (Stripe uses smallest currency unit)
            long amountInCents = order.getTotalAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .longValue();

            // Create Payment Intent
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("usd")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .putMetadata("orderId", orderId)
                    .putMetadata("userId", userId)
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Update order with payment intent ID
            orderService.updateOrderPaymentIntent(orderId, paymentIntent.getId());

            return PaymentIntentResponse.builder()
                    .clientSecret(paymentIntent.getClientSecret())
                    .paymentIntentId(paymentIntent.getId())
                    .build();

        } catch (StripeException e) {
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage(), e);
        }
    }

    /**
     * Confirm payment and update order status
     */
    @Transactional
    public void confirmPayment(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

            if ("succeeded".equals(paymentIntent.getStatus())) {
                // Find order by payment intent ID
                Order order = orderRepository.findByStripePaymentIntentId(paymentIntentId);
                if (order != null) {
                    // Update order status to PAID
                    orderService.updateOrderStatus(order.getId(), OrderStatus.PAID);
                }
            }
        } catch (StripeException e) {
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage(), e);
        }
    }

    /**
     * Handle Stripe webhook events
     */
    @Transactional
    public void handleWebhookEvent(String payload, String signature) {
        // This method can be expanded to handle various Stripe webhook events
        // For now, we'll just log that a webhook was received
        // In production, you should verify the webhook signature
    }
}
