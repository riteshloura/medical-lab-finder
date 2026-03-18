package com.lablocator.repository;

import com.lablocator.model.LabTest;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabTestRepo extends JpaRepository<LabTest, Long> {
    List<LabTest> findByLabId(Long labId);
    Optional<LabTest> findByLabIdAndTestId(Long labId, Long testId);

    @Transactional
    @Modifying
    @Query("DELETE FROM LabTest lt WHERE lt.lab.id = :labId AND lt.test.id = :testId")
    int deleteByTestId(@Param("labId") Long labId, @Param("testId") Long testId);
}
