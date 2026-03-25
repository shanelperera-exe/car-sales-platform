package com.redrive.adminpanel.dto;

import java.math.BigDecimal;

public record MonthlySalesPoint(
        String month,
        long transactionCount,
        BigDecimal revenue
) {
}

