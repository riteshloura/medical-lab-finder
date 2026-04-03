package com.lablocator.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LabRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private RequestType requestType;

    @Enumerated(EnumType.STRING)
    private RequestStatus requestStatus;

    private Long labId;

    @ManyToOne
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @Column(columnDefinition = "TEXT")
    private String changePayload;
    private String adminRemark="";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
