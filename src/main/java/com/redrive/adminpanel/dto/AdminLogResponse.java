package com.redrive.adminpanel.dto;

import java.time.LocalDateTime;

public record AdminLogResponse(
        Long id,
        Long adminId,
        String adminName,
        String action,
        String target,
        String status,
        Integer executionTimeMs,
        LocalDateTime createdAt
) {
}

