package com.redrive.adminpanel.repository;

import com.redrive.adminpanel.entity.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {

    List<AdminLog> findTop100ByOrderByCreatedAtDesc();
}

