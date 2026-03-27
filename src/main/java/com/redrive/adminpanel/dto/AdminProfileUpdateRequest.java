package com.redrive.adminpanel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminProfileUpdateRequest(
        @NotBlank(message = "First name is required.")
        String firstName,
        @NotBlank(message = "Last name is required.")
        String lastName,
        @NotBlank(message = "Email is required.")
        @Email(message = "Email must be valid.")
        String email,
        String phone,
        String location,
        String password
) {
}
