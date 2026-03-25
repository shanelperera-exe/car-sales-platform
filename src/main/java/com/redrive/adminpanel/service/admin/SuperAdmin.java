package com.redrive.adminpanel.service.admin;

import com.redrive.adminpanel.entity.User;

public class SuperAdmin extends Admin {

    public SuperAdmin(User user) {
        super(user);
    }

    @Override
    public boolean canCreateAdmins() {
        return true;
    }

    @Override
    public boolean canOverridePlatformData() {
        return true;
    }
}

