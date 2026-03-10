package com.lablocator.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Entity
@Data
@ToString(exclude = { "lab", "bookingTests" })
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LabTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double price;
    private Boolean homeCollectionAvailable;

    @ManyToOne
    @JoinColumn(name = "lab_id", nullable = false)
    private Lab lab;

    @ManyToOne
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @OneToMany(mappedBy = "labTest")
    @JsonIgnore
    private List<BookingTest> bookingTests;

}
