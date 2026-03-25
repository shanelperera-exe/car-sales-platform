package com.redrive.adminpanel.service;

import com.redrive.adminpanel.entity.AdminLog;
import com.redrive.adminpanel.entity.User;
import com.redrive.adminpanel.entity.enums.UserStatus;
import com.redrive.adminpanel.exception.ResourceNotFoundException;
import com.redrive.adminpanel.exception.UnauthorizedException;
import com.redrive.adminpanel.repository.AdminLogRepository;
import com.redrive.adminpanel.repository.UserRepository;
import com.redrive.adminpanel.service.admin.Admin;
import com.redrive.adminpanel.service.admin.AdminFactory;

public abstract class BaseAdminService {

    protected final UserRepository userRepository;
    protected final AdminLogRepository adminLogRepository;

    protected BaseAdminService(UserRepository userRepository, AdminLogRepository adminLogRepository) {
        this.userRepository = userRepository;
        this.adminLogRepository = adminLogRepository;
    }

    protected Admin getAdminActor(Long adminId) {
        User user = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found."));

        if (!user.isAdminAccount()) {
            throw new UnauthorizedException("This account does not have admin access.");
        }

        if (user.getAccountStatus() == UserStatus.BANNED) {
            throw new UnauthorizedException("This admin account is banned.");
        }

        return AdminFactory.fromUser(user);
    }

    protected void requireAdminCreationPermission(Admin admin) {
        if (!admin.canCreateAdmins()) {
            throw new UnauthorizedException("Only a super admin can create admin accounts.");
        }
    }

    protected void requirePlatformOverridePermission(Admin admin) {
        if (!admin.canOverridePlatformData()) {
            throw new UnauthorizedException("Only a super admin can perform this action.");
        }
    }

    protected void saveLog(User admin, String action, String target, String status, long startTime) {
        AdminLog adminLog = new AdminLog();
        adminLog.setAdmin(admin);
        adminLog.setAction(action);
        adminLog.setTarget(target);
        adminLog.setStatus(status);
        adminLog.setExecutionTimeMs((int) (System.currentTimeMillis() - startTime));
        adminLogRepository.save(adminLog);
    }
}

