package com.redrive.adminpanel.dto;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        long totalUsers,
        long totalAdmins,
        long activeListings,
        long pendingListings,
        long rejectedListings,
        long totalTransactions,
        long completedTransactions,
        BigDecimal totalRevenue
) {
}

