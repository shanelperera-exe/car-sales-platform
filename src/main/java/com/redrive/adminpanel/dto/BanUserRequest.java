package com.redrive.adminpanel.dto;

import jakarta.validation.constraints.NotBlank;

public record BanUserRequest(
        @NotBlank(message = "Ban reason is required.")
        String reason
) {
}

