package com.lablocator.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(
        uniqueConstraints = @UniqueConstraint(columnNames = {"lab_id", "date"})
)
public class LabSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lab_id")
    private Lab lab;

    private LocalDate date;

    private Integer totalSlots;     // from lab.slotCapacityOnline
    private Integer bookedSlots;    // increment on booking
}
