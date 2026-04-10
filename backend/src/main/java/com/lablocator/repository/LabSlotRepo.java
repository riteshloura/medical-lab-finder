package com.lablocator.repository;

import com.lablocator.model.Lab;
import com.lablocator.model.LabSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface LabSlotRepo extends JpaRepository<LabSlot, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    LabSlot findByLabAndDate(Lab lab, LocalDate today);

    LabSlot findSlotByLabAndDate(Lab lab, LocalDate date);
}
