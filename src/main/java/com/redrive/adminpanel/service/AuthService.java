package com.redrive.adminpanel.service;

import com.redrive.adminpanel.dto.LoginRequest;
import com.redrive.adminpanel.dto.LoginResponse;
import com.redrive.adminpanel.entity.User;
import com.redrive.adminpanel.entity.enums.UserStatus;
import com.redrive.adminpanel.exception.UnauthorizedException;
import com.redrive.adminpanel.repository.AdminLogRepository;
import com.redrive.adminpanel.repository.UserRepository;
import com.redrive.adminpanel.service.mapper.AdminMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService extends BaseAdminService {

    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       AdminLogRepository adminLogRepository,
                       PasswordEncoder passwordEncoder) {
        super(userRepository, adminLogRepository);
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        long startTime = System.currentTimeMillis();

        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!user.isAdminAccount()) {
            throw new UnauthorizedException("Only admin accounts can log in here.");
        }

        if (!passwordMatches(request.password(), user.getPassword())) {
            saveLog(user, "LOGIN", "ADMIN PORTAL", "FAILED", startTime);
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (!isBcryptHash(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.password()));
            userRepository.save(user);
        }

        if (user.getAccountStatus() == UserStatus.BANNED) {
            saveLog(user, "LOGIN", "ADMIN PORTAL", "FAILED", startTime);
            throw new UnauthorizedException("This admin account is banned.");
        }

        saveLog(user, "LOGIN", "ADMIN PORTAL", "SUCCESS", startTime);
        return AdminMapper.toLoginResponse(user);
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if (storedPassword == null || storedPassword.isBlank()) {
            return false;
        }

        if (isBcryptHash(storedPassword)) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }

        // Backward compatibility for existing plain-text rows.
        return storedPassword.equals(rawPassword);
    }

    private boolean isBcryptHash(String value) {
        return value != null && value.length() == 60 && value.startsWith("$2");
    }
}
