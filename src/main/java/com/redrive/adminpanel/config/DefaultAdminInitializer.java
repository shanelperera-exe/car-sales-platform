package com.redrive.adminpanel.config;

import com.redrive.adminpanel.entity.User;
import com.redrive.adminpanel.entity.enums.Role;
import com.redrive.adminpanel.entity.enums.UserStatus;
import com.redrive.adminpanel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DefaultAdminInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DefaultAdminInitializer.class);

    private final UserRepository userRepository;
    private final BootstrapAdminProperties bootstrapAdminProperties;
    private final PasswordEncoder passwordEncoder;

    public DefaultAdminInitializer(UserRepository userRepository,
                                   BootstrapAdminProperties bootstrapAdminProperties,
                                   PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.bootstrapAdminProperties = bootstrapAdminProperties;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!bootstrapAdminProperties.isEnabled()) {
            return;
        }

        long adminCount = userRepository.countByRoleIn(List.of(Role.ADMIN, Role.SUPER_ADMIN));
        if (adminCount > 0) {
            return;
        }

        String normalizedEmail = bootstrapAdminProperties.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalStateException(
                    "Cannot create the default admin account because the email '" + normalizedEmail
                            + "' is already used by another account."
            );
        }

        String bootstrapPassword = bootstrapAdminProperties.getPassword().trim();
        User admin = new User();
        admin.setFirstName(bootstrapAdminProperties.getFirstName().trim());
        admin.setLastName(bootstrapAdminProperties.getLastName().trim());
        admin.setEmail(normalizedEmail);
        admin.setPassword(isBcryptHash(bootstrapPassword)
                ? bootstrapPassword
                : passwordEncoder.encode(bootstrapPassword));
        admin.setRole(Role.SUPER_ADMIN);
        admin.setAccountStatus(UserStatus.ACTIVE);

        userRepository.save(admin);
        logger.info("Created default super admin account for {}", normalizedEmail);
    }

    private boolean isBcryptHash(String value) {
        return value != null && value.length() == 60 && value.startsWith("$2");
    }
}
