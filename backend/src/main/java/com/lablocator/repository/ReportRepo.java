package com.lablocator.repository;

import com.lablocator.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepo extends JpaRepository<Report, Long> {
    List<Report> findByBookingTestId(Long bookingTestId);
}
