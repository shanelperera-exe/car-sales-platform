package com.redrive.adminpanel.controller;

import com.redrive.adminpanel.dto.BanUserRequest;
import com.redrive.adminpanel.dto.CarListingResponse;
import com.redrive.adminpanel.dto.ListingDecisionRequest;
import com.redrive.adminpanel.dto.UserManagementResponse;
import com.redrive.adminpanel.entity.enums.CarStatus;
import com.redrive.adminpanel.entity.enums.Role;
import com.redrive.adminpanel.entity.enums.UserStatus;
import com.redrive.adminpanel.service.ListingImageProxyService;
import com.redrive.adminpanel.service.ModerationService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class ModerationController {

    private final ModerationService moderationService;
    private final ListingImageProxyService listingImageProxyService;

    public ModerationController(ModerationService moderationService,
                                ListingImageProxyService listingImageProxyService) {
        this.moderationService = moderationService;
        this.listingImageProxyService = listingImageProxyService;
    }

    @GetMapping("/listings/pending")
    public ResponseEntity<List<CarListingResponse>> getPendingListings(@RequestHeader("X-Admin-Id") Long adminId) {
        return ResponseEntity.ok(moderationService.getPendingListings(adminId));
    }

    @GetMapping("/listings")
    public ResponseEntity<List<CarListingResponse>> getListings(@RequestHeader("X-Admin-Id") Long adminId,
                                                                @RequestParam(required = false) CarStatus status) {
        return ResponseEntity.ok(moderationService.getListings(adminId, status));
    }

    @GetMapping("/listings/{carId}/image")
    public ResponseEntity<byte[]> getListingImage(@PathVariable Long carId) {
        ListingImageProxyService.ImagePayload imagePayload = listingImageProxyService.loadListingImage(carId);

        MediaType mediaType = MediaType.parseMediaType(imagePayload.contentType());
        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.noCache())
                .body(imagePayload.bytes());
    }

    @PutMapping("/listings/{carId}/approve")
    public ResponseEntity<CarListingResponse> approveListing(@RequestHeader("X-Admin-Id") Long adminId,
                                                             @PathVariable Long carId,
                                                             @RequestBody(required = false) ListingDecisionRequest request) {
        return ResponseEntity.ok(moderationService.approveListing(adminId, carId, request));
    }

    @PutMapping("/listings/{carId}/reject")
    public ResponseEntity<CarListingResponse> rejectListing(@RequestHeader("X-Admin-Id") Long adminId,
                                                            @PathVariable Long carId,
                                                            @RequestBody(required = false) ListingDecisionRequest request) {
        return ResponseEntity.ok(moderationService.rejectListing(adminId, carId, request));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserManagementResponse>> getUsers(@RequestHeader("X-Admin-Id") Long adminId,
                                                                 @RequestParam(required = false) Role role,
                                                                 @RequestParam(required = false) UserStatus accountStatus) {
        return ResponseEntity.ok(moderationService.getUsers(adminId, role, accountStatus));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserManagementResponse> getUserById(@RequestHeader("X-Admin-Id") Long adminId,
                                                              @PathVariable Long userId) {
        return ResponseEntity.ok(moderationService.getUserById(adminId, userId));
    }

    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<UserManagementResponse> banUser(@RequestHeader("X-Admin-Id") Long adminId,
                                                          @PathVariable Long userId,
                                                          @Valid @RequestBody BanUserRequest request) {
        return ResponseEntity.ok(moderationService.banUser(adminId, userId, request));
    }

    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<UserManagementResponse> unbanUser(@RequestHeader("X-Admin-Id") Long adminId,
                                                            @PathVariable Long userId) {
        return ResponseEntity.ok(moderationService.unbanUser(adminId, userId));
    }
}
