package com.lablocator.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Data
@ToString(exclude = { "booking", "labTest", "reports" })
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class BookingTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    @JsonIgnore
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "lab_test_id")
    private LabTest labTest;

    @OneToMany(mappedBy = "bookingTest")
    @JsonIgnore
    private List<Report> reports;
}
