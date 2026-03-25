package com.redrive.adminpanel.repository;

import com.redrive.adminpanel.entity.Car;
import com.redrive.adminpanel.entity.enums.CarStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarRepository extends JpaRepository<Car, Long> {

    List<Car> findAllByOrderByCreatedAtDesc();

    List<Car> findByStatusOrderByCreatedAtDesc(CarStatus status);

    long countByStatus(CarStatus status);
}

