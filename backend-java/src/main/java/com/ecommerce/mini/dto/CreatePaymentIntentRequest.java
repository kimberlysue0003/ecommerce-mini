package com.ecommerce.mini.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentIntentRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;
}
