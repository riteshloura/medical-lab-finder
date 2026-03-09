package com.lablocator.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reportURI;

    @ManyToOne
    @JoinColumn(name = "booking_test_id")
    private BookingTest bookingTest;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
    private LocalDateTime uploadedAt;
}
