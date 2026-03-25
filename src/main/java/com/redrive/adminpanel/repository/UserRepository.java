package com.redrive.adminpanel.repository;

import com.redrive.adminpanel.entity.User;
import com.redrive.adminpanel.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findAllByOrderByCreatedAtDesc();

    List<User> findByRoleInOrderByCreatedAtDesc(Collection<Role> roles);

    long countByRoleIn(Collection<Role> roles);
}

