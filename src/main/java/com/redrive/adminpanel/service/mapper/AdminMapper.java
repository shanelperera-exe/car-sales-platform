package com.redrive.adminpanel.service.mapper;

import com.redrive.adminpanel.dto.AdminAccountResponse;
import com.redrive.adminpanel.dto.AdminLogResponse;
import com.redrive.adminpanel.dto.CarListingResponse;
import com.redrive.adminpanel.dto.LoginResponse;
import com.redrive.adminpanel.dto.UserManagementResponse;
import com.redrive.adminpanel.entity.AdminLog;
import com.redrive.adminpanel.entity.Car;
import com.redrive.adminpanel.entity.User;

public final class AdminMapper {

    private AdminMapper() {
    }

    public static LoginResponse toLoginResponse(User user) {
        return new LoginResponse(
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                user.getAccountStatus().name(),
                "Login successful."
        );
    }

    public static AdminAccountResponse toAdminAccountResponse(User user) {
        return new AdminAccountResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getLocation(),
                user.getRole().name(),
                user.getAccountStatus().name(),
                user.getCreatedAt()
        );
    }

    public static CarListingResponse toCarListingResponse(Car car) {
        return new CarListingResponse(
                car.getId(),
                car.getSeller().getId(),
                car.getSeller().getFirstName() + " " + car.getSeller().getLastName(),
                car.getVin(),
                car.getMake(),
                car.getModel(),
                car.getYear(),
                car.getMileage(),
                car.getFuelType(),
                car.getPrice(),
                car.getLocation(),
                car.getStatus().name(),
                car.getModerationNote(),
                car.getCreatedAt()
        );
    }

    public static UserManagementResponse toUserManagementResponse(User user) {
        return new UserManagementResponse(
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getLocation(),
                user.getRole().name(),
                user.getAccountStatus().name(),
                user.getCreatedAt()
        );
    }

    public static AdminLogResponse toAdminLogResponse(AdminLog adminLog) {
        String adminName = adminLog.getAdmin() == null
                ? "Unknown Admin"
                : adminLog.getAdmin().getFirstName() + " " + adminLog.getAdmin().getLastName();

        Long adminId = adminLog.getAdmin() == null ? null : adminLog.getAdmin().getId();

        return new AdminLogResponse(
                adminLog.getId(),
                adminId,
                adminName,
                adminLog.getAction(),
                adminLog.getTarget(),
                adminLog.getStatus(),
                adminLog.getExecutionTimeMs(),
                adminLog.getCreatedAt()
        );
    }
}
