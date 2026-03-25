package com.redrive.adminpanel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CarListingResponse(
        Long id,
        Long sellerId,
        String sellerName,
        String vin,
        String make,
        String model,
        Integer year,
        Integer mileage,
        String fuelType,
        BigDecimal price,
        String location,
        String status,
        String moderationNote,
        LocalDateTime createdAt
) {
}

