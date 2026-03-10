package com.lablocator.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@ToString(exclude = "bookingTests")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "lab_id")
    private Lab lab;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<BookingTest> bookingTests;

    private LocalDateTime bookingDate;

    private LocalTime timeSlot;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private LocalDateTime createdAt;
}
