package com.redrive.adminpanel.repository;

import com.redrive.adminpanel.entity.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CarImageRepository extends JpaRepository<CarImage, Long> {

    @Query(value = """
            SELECT image_url
            FROM car_images
            WHERE car_id = :carId
            ORDER BY is_primary DESC, id ASC
            LIMIT 1
            """, nativeQuery = true)
    Optional<String> findPrimaryImageUrlByCarId(@Param("carId") Long carId);

    @Query(value = """
            SELECT car_id, image_url
            FROM car_images
            WHERE car_id IN (:carIds)
            ORDER BY car_id ASC, is_primary DESC, id ASC
            """, nativeQuery = true)
    List<Object[]> findImageRowsByCarIds(@Param("carIds") Collection<Long> carIds);
}
