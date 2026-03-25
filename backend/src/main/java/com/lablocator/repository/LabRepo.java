package com.lablocator.repository;

import com.lablocator.model.Lab;
import com.lablocator.projection.NearbyLabProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabRepo extends JpaRepository<Lab, Long> {
    List<Lab> findByCityIgnoreCase(String city);
    List<Lab> findAllByOwnerId(Long ownerId);

    @Query(value = """
    SELECT * FROM (
        SELECT 
            l.id,
            l.name,
            l.description,
            l.address,
            l.city,
            l.state,
            l.contact_number AS contactNumber,
            l.latitude,
            l.longitude,
            l.slot_capacity_online AS slotCapacityOnline,
            l.opening_time AS openingTime,
            l.closing_time AS closingTime,
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
    List<NearbyLabProjection> findNearbyLabs(Double lat, Double lng, Double radius);

//    @Query(value = """
//        SELECT * FROM (
//            SELECT l.*,
//            (
//                6371 * acos(
//                    cos(radians(:lat))
//                    * cos(radians(l.latitude))
//                    * cos(radians(l.longitude) - radians(:lng))
//                    + sin(radians(:lat))
//                    * sin(radians(l.latitude))
//                )
//            ) AS distance
//            FROM lab l
//        ) AS nearby
//        WHERE distance <= :radius
//        ORDER BY distance
//        """, nativeQuery = true)
//    List<Lab> findNearbyLabs(Double lat, Double lng, Double radius);

    List<Lab> findByLabTests_Test_NameContainingIgnoreCaseAndCityContainingIgnoreCase(
            String testName,
            String city
    );
}
