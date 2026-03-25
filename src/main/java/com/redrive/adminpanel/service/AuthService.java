package com.redrive.adminpanel.service;

import com.redrive.adminpanel.dto.LoginRequest;
import com.redrive.adminpanel.dto.LoginResponse;
import com.redrive.adminpanel.entity.User;
import com.redrive.adminpanel.entity.enums.UserStatus;
import com.redrive.adminpanel.exception.UnauthorizedException;
import com.redrive.adminpanel.repository.AdminLogRepository;
import com.redrive.adminpanel.repository.UserRepository;
import com.redrive.adminpanel.service.mapper.AdminMapper;
import org.springframework.stereotype.Service;

@Service
public class AuthService extends BaseAdminService {

    public AuthService(UserRepository userRepository, AdminLogRepository adminLogRepository) {
        super(userRepository, adminLogRepository);
    }

    public LoginResponse login(LoginRequest request) {
        long startTime = System.currentTimeMillis();

        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!user.isAdminAccount()) {
            throw new UnauthorizedException("Only admin accounts can log in here.");
        }

        if (!user.getPassword().equals(request.password())) {
            saveLog(user, "LOGIN", "ADMIN PORTAL", "FAILED", startTime);
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (user.getAccountStatus() == UserStatus.BANNED) {
            saveLog(user, "LOGIN", "ADMIN PORTAL", "FAILED", startTime);
            throw new UnauthorizedException("This admin account is banned.");
        }

        saveLog(user, "LOGIN", "ADMIN PORTAL", "SUCCESS", startTime);
        return AdminMapper.toLoginResponse(user);
    }
}

