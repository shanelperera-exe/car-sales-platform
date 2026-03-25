package com.redrive.adminpanel.service.admin;

import com.redrive.adminpanel.entity.User;
import com.redrive.adminpanel.entity.enums.Role;
import com.redrive.adminpanel.exception.UnauthorizedException;

public final class AdminFactory {

    private AdminFactory() {
    }

    public static Admin fromUser(User user) {
        if (user.getRole() == Role.SUPER_ADMIN) {
            return new SuperAdmin(user);
        }
        if (user.getRole() == Role.ADMIN) {
            return new StandardAdmin(user);
        }
        throw new UnauthorizedException("This user is not an admin account.");
    }
}

