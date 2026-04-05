package com.lablocator.repository;

import com.lablocator.model.LabRequest;
import com.lablocator.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabRequestRepo extends JpaRepository<LabRequest, Long> {

    List<LabRequest> findAllByRequestStatus(RequestStatus status);

    List<LabRequest> findAllByRequestedByIdOrderByCreatedAtDesc(Long userId);

    List<LabRequest> findAllByOrderByCreatedAtDesc();
}
