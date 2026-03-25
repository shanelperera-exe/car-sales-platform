package com.redrive.adminpanel.repository;

import com.redrive.adminpanel.entity.Transaction;
import com.redrive.adminpanel.entity.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByOrderByCreatedAtDesc();

    long countByStatus(TransactionStatus status);

    @Query("select coalesce(sum(t.amountPaid), 0) from Transaction t where t.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") TransactionStatus status);
}
