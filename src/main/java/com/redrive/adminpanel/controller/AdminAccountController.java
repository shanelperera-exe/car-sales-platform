package com.redrive.adminpanel.controller;

import com.redrive.adminpanel.dto.AdminAccountResponse;
import com.redrive.adminpanel.dto.AdminRegistrationRequest;
import com.redrive.adminpanel.service.AdminAccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/accounts")
public class AdminAccountController {

    private final AdminAccountService adminAccountService;

    public AdminAccountController(AdminAccountService adminAccountService) {
        this.adminAccountService = adminAccountService;
    }

    @PostMapping
    public ResponseEntity<AdminAccountResponse> createAdmin(@RequestHeader("X-Admin-Id") Long adminId,
                                                            @Valid @RequestBody AdminRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminAccountService.createAdmin(adminId, request));
    }

    @GetMapping
    public ResponseEntity<List<AdminAccountResponse>> getAdminAccounts(@RequestHeader("X-Admin-Id") Long adminId) {
        return ResponseEntity.ok(adminAccountService.getAllAdminAccounts(adminId));
    }
}

