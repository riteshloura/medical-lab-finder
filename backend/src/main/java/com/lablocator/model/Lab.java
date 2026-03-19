package com.lablocator.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@ToString(exclude = { "owner", "labTests" })
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Lab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String address;
    private String city;
    private String state;
    private Double longitude;
    private Double latitude;
    private String contactNumber;
    private Integer slotCapacityOnline;
    private Integer totalReviews;
    private Double avgRating;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @OneToMany(mappedBy = "lab")
    @JsonIgnore
    private List<LabTest> labTests;

    @OneToMany(mappedBy = "lab")
    @JsonIgnore
    private List<Review> reviews;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
