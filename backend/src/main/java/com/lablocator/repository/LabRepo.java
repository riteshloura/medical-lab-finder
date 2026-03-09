package com.lablocator.repository;

import com.lablocator.model.Lab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabRepo extends JpaRepository<Lab, Long> {
}
