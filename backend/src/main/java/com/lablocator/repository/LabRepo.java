package com.lablocator.repository;

import com.lablocator.model.Lab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabRepo extends JpaRepository<Lab, Long> {
    List<Lab> findByCityIgnoreCase(String city);

    @Query(value = """
        SELECT * FROM (
            SELECT l.*,
            (
                6371 * acos(
                    cos(radians(:lat))
                    * cos(radians(l.latitude))
                    * cos(radians(l.longitude) - radians(:lng))
                    + sin(radians(:lat))
                    * sin(radians(l.latitude))
                )
            ) AS distance
            FROM lab l
        ) AS nearby
        WHERE distance <= :radius
        ORDER BY distance
        """, nativeQuery = true)
    List<Lab> findNearbyLabs(Double lat, Double lng, Double radius);
}
