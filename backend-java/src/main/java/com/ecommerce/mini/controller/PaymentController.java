package com.ecommerce.mini.controller;

import com.ecommerce.mini.dto.ConfirmPaymentRequest;
import com.ecommerce.mini.dto.CreatePaymentIntentRequest;
import com.ecommerce.mini.dto.PaymentIntentResponse;
import com.ecommerce.mini.entity.User;
import com.ecommerce.mini.repository.UserRepository;
import com.ecommerce.mini.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for payment operations
 */
@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    /**
     * Create a Stripe Payment Intent
     * POST /api/payment/create-intent
     */
    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            Authentication authentication,
            @Valid @RequestBody CreatePaymentIntentRequest request) {
        String userId = getUserIdFromAuth(authentication);
        PaymentIntentResponse response = paymentService.createPaymentIntent(userId, request.getOrderId());
        return ResponseEntity.ok(response);
    }

    /**
     * Confirm payment (called after successful payment)
     * POST /api/payment/confirm
     */
    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmPayment(@Valid @RequestBody ConfirmPaymentRequest request) {
        paymentService.confirmPayment(request.getPaymentIntentId());
        return ResponseEntity.ok().build();
    }

    /**
     * Stripe webhook endpoint
     * POST /api/payment/webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {
        paymentService.handleWebhookEvent(payload, signature);
        return ResponseEntity.ok().build();
    }

    private String getUserIdFromAuth(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
