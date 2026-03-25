package com.redrive.adminpanel.dto;

import java.time.LocalDateTime;

public record UserManagementResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String location,
        String role,
        String accountStatus,
        LocalDateTime createdAt
) {
}

