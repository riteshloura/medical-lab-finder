package com.lablocator.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

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
//    @JsonIgnore
    private List<BookingTest> bookingTests;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Review review;

//    @CreationTimestamp
    @Column(name = "booking_date", updatable = false)
    private LocalDateTime bookingDate; // also give tommarow date, fix entire lab_owner booking page

    private LocalTime timeSlot;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
