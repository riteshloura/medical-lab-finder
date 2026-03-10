package com.lablocator.repository;

import com.lablocator.model.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabTestRepo extends JpaRepository<LabTest, Long> {
    List<LabTest> findByLabId(Long labId);
}
