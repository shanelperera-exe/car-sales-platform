package com.redrive.adminpanel.dto;

import java.math.BigDecimal;
import java.util.List;

public record SalesReportResponse(
        long completedTransactions,
        BigDecimal totalRevenue,
        List<MonthlySalesPoint> monthlySales
) {
}

