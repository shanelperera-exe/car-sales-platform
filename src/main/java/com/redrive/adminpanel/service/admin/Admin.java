package com.redrive.adminpanel.service.admin;

import com.redrive.adminpanel.entity.User;

public abstract class Admin {

    private final User user;

    protected Admin(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public boolean canModerateListings() {
        return true;
    }

    public boolean canBanUsers() {
        return true;
    }

    public abstract boolean canCreateAdmins();

    public abstract boolean canOverridePlatformData();
}

