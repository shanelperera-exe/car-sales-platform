package com.redrive.adminpanel.service;

import com.redrive.adminpanel.dto.AdminAccountResponse;
import com.redrive.adminpanel.dto.AdminProfileUpdateRequest;
import com.redrive.adminpanel.dto.AdminRegistrationRequest;
import com.redrive.adminpanel.entity.User;
import com.redrive.adminpanel.entity.enums.Role;
import com.redrive.adminpanel.entity.enums.UserStatus;
import com.redrive.adminpanel.exception.BadRequestException;
import com.redrive.adminpanel.repository.AdminLogRepository;
import com.redrive.adminpanel.repository.UserRepository;
import com.redrive.adminpanel.service.admin.Admin;
import com.redrive.adminpanel.service.mapper.AdminMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminAccountService extends BaseAdminService {

    private final PasswordEncoder passwordEncoder;

    public AdminAccountService(UserRepository userRepository,
                               AdminLogRepository adminLogRepository,
                               PasswordEncoder passwordEncoder) {
        super(userRepository, adminLogRepository);
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AdminAccountResponse createAdmin(Long adminId, AdminRegistrationRequest request) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);
        requireAdminCreationPermission(adminActor);

        if (userRepository.existsByEmailIgnoreCase(request.email().trim())) {
            saveLog(adminActor.getUser(), "CREATE_ADMIN", request.email(), "FAILED", startTime);
            throw new BadRequestException("An account already exists with this email.");
        }

        User admin = new User();
        admin.setFirstName(request.firstName().trim());
        admin.setLastName(request.lastName().trim());
        admin.setEmail(request.email().trim().toLowerCase());
        admin.setPassword(passwordEncoder.encode(request.password()));
        admin.setPhone(cleanText(request.phone()));
        admin.setLocation(cleanText(request.location()));
        admin.setRole(parseAdminRole(request.role()));
        admin.setAccountStatus(UserStatus.ACTIVE);

        User savedAdmin = userRepository.save(admin);
        saveLog(adminActor.getUser(), "CREATE_ADMIN", "Admin ID: " + savedAdmin.getId(), "SUCCESS", startTime);

        return AdminMapper.toAdminAccountResponse(savedAdmin);
    }

    @Transactional
    public List<AdminAccountResponse> getAllAdminAccounts(Long adminId) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);

        List<AdminAccountResponse> response = userRepository.findByRoleInOrderByCreatedAtDesc(List.of(Role.ADMIN, Role.SUPER_ADMIN))
                .stream()
                .map(AdminMapper::toAdminAccountResponse)
                .toList();

        saveLog(adminActor.getUser(), "VIEW_ADMINS", "ADMIN ACCOUNTS", "SUCCESS", startTime);
        return response;
    }

    @Transactional
    public AdminAccountResponse updateOwnAccount(Long adminId, AdminProfileUpdateRequest request) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);
        User adminUser = adminActor.getUser();

        String normalizedEmail = request.email().trim().toLowerCase();
        boolean emailChanged = !adminUser.getEmail().equalsIgnoreCase(normalizedEmail);
        if (emailChanged && userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            saveLog(adminUser, "UPDATE_OWN_ACCOUNT", "Admin ID: " + adminUser.getId(), "FAILED", startTime);
            throw new BadRequestException("An account already exists with this email.");
        }

        String password = request.password();
        if (password != null && !password.isBlank() && password.trim().length() < 8) {
            saveLog(adminUser, "UPDATE_OWN_ACCOUNT", "Admin ID: " + adminUser.getId(), "FAILED", startTime);
            throw new BadRequestException("Password must be at least 8 characters.");
        }

        adminUser.setFirstName(request.firstName().trim());
        adminUser.setLastName(request.lastName().trim());
        adminUser.setEmail(normalizedEmail);
        adminUser.setPhone(cleanText(request.phone()));
        adminUser.setLocation(cleanText(request.location()));

        if (password != null && !password.isBlank()) {
            adminUser.setPassword(passwordEncoder.encode(password.trim()));
        }

        User updated = userRepository.save(adminUser);
        saveLog(updated, "UPDATE_OWN_ACCOUNT", "Admin ID: " + updated.getId(), "SUCCESS", startTime);
        return AdminMapper.toAdminAccountResponse(updated);
    }

    private Role parseAdminRole(String roleValue) {
        try {
            Role role = Role.valueOf(roleValue.trim().toUpperCase());
            if (role != Role.ADMIN && role != Role.SUPER_ADMIN) {
                throw new BadRequestException("Role must be ADMIN or SUPER_ADMIN.");
            }
            return role;
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Role must be ADMIN or SUPER_ADMIN.");
        }
    }

    private String cleanText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
