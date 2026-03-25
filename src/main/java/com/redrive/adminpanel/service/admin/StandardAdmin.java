package com.redrive.adminpanel.service.admin;

import com.redrive.adminpanel.entity.User;

public class StandardAdmin extends Admin {

    public StandardAdmin(User user) {
        super(user);
    }

    @Override
    public boolean canCreateAdmins() {
        return false;
    }

    @Override
    public boolean canOverridePlatformData() {
        return false;
    }
}

