package com.lablocator.repository;

import com.lablocator.model.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabTestRepo extends JpaRepository<LabTest, Long> {
}
