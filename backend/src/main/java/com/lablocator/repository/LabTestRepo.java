package com.lablocator.repository;

import com.lablocator.model.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabTestRepo extends JpaRepository<LabTest, Long> {
    List<LabTest> findByLabId(Long labId);
    Optional<LabTest> findByLabIdAndTestId(Long labId, Long testId);
}
