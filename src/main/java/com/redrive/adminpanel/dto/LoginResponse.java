package com.redrive.adminpanel.dto;

public record LoginResponse(
        Long id,
        String fullName,
        String email,
        String role,
        String accountStatus,
        String message
) {
}

