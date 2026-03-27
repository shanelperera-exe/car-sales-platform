package com.redrive.adminpanel.config;

import com.redrive.adminpanel.entity.enums.Role;
import com.redrive.adminpanel.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DefaultAdminInitializerIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void createsDefaultSuperAdminOnStartup() {
        var user = userRepository.findByEmailIgnoreCase("admin@redrive.com");

        assertThat(user).isPresent();
        assertThat(user.get().getRole()).isEqualTo(Role.SUPER_ADMIN);
        assertThat(user.get().getPassword()).startsWith("$2");
        assertThat(passwordEncoder.matches("Admin1234", user.get().getPassword())).isTrue();
        assertThat(userRepository.countByRoleIn(List.of(Role.ADMIN, Role.SUPER_ADMIN))).isEqualTo(1);
    }
}
