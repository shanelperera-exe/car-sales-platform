package com.redrive.adminpanel.dto;

import java.time.LocalDateTime;

public record AdminAccountResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String location,
        String role,
        String accountStatus,
        LocalDateTime createdAt
) {
}

