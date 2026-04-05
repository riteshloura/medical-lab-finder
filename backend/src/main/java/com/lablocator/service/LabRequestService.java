package com.lablocator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lablocator.dto.admin.LabRequestResponse;
import com.lablocator.dto.admin.UpdateLabRequestStatusReq;
import com.lablocator.dto.lab.CreateLabRequest;
import com.lablocator.exceptions.AccessDeniedException;
import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.*;
import com.lablocator.repository.LabRepo;
import com.lablocator.repository.LabRequestRepo;
import com.lablocator.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LabRequestService {

    @Autowired
    private LabRequestRepo labRequestRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private LabRepo labRepo;
    @Autowired
    private LabService labService;

    // ── JSON helpers ───────────────────────────────────────────────────────────

    public String convertToJson(CreateLabRequest req) {
        try {
            return objectMapper.writeValueAsString(req);
        } catch (Exception e) {
            throw new RuntimeException("Error converting to JSON");
        }
    }

    public CreateLabRequest convertToDTO(String json) {
        try {
            return objectMapper.readValue(json, CreateLabRequest.class);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing JSON");
        }
    }

    private LabRequestResponse toResponse(LabRequest req) {
        var user = req.getRequestedBy();
        var ownerDto = new LabRequestResponse.RequestedByDto(user.getId(), user.getName(), user.getEmail());
        return new LabRequestResponse(
                req.getId(),
                req.getRequestType(),
                req.getRequestStatus(),
                req.getLabId(),
                req.getChangePayload(),
                req.getAdminRemark(),
                req.getCreatedAt(),
                req.getReviewedAt(),
                ownerDto);
    }

    // ── Lab owner: create request ───────────────────────────────────────────────

    public LabRequestResponse createLabRequest(CreateLabRequest req, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LabRequest labRequest = LabRequest.builder()
                .requestType(RequestType.CREATE_LAB)
                .requestStatus(RequestStatus.PENDING)
                .requestedBy(user)
                .changePayload(convertToJson(req))
                .adminRemark("")
                .build();

        return toResponse(labRequestRepo.save(labRequest));
    }

    // ── Lab owner: update request ───────────────────────────────────────────────

    public LabRequestResponse updateLabRequest(Long labId, CreateLabRequest req, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Lab labEntity = labRepo.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab", labId));

        if (!labEntity.getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorised to update this lab");
        }

        LabRequest labRequest = LabRequest.builder()
                .requestType(RequestType.UPDATE_LAB)
                .requestStatus(RequestStatus.PENDING)
                .requestedBy(user)
                .changePayload(convertToJson(req))
                .labId(labId)
                .adminRemark("")
                .build();

        return toResponse(labRequestRepo.save(labRequest));
    }

    // ── Lab owner: delete request ───────────────────────────────────────────────

    public LabRequestResponse deleteLabRequest(Long labId, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Lab labEntity = labRepo.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab", labId));

        if (!labEntity.getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorised to delete this lab");
        }

        LabRequest labRequest = LabRequest.builder()
                .requestType(RequestType.DELETE_LAB)
                .requestStatus(RequestStatus.PENDING)
                .requestedBy(user)
                .labId(labId)
                .adminRemark("")
                .build();

        return toResponse(labRequestRepo.save(labRequest));
    }

    // ── Admin: update request status ────────────────────────────────────────────
    @Transactional
    public ResponseEntity<?> updateLabRequestStatus(Long reqId, UpdateLabRequestStatusReq req, String email) {
        userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LabRequest labRequest = labRequestRepo.findById(reqId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab request not found"));

        RequestStatus status = req.status();

        if (status.equals(RequestStatus.PENDING)) {
            return ResponseEntity.badRequest().body("Cannot set status back to PENDING");
        }

        labRequest.setAdminRemark(req.adminRemark() != null ? req.adminRemark() : "");
        labRequest.setRequestStatus(status);
        labRequest.setReviewedAt(LocalDateTime.now());

        if (status.equals(RequestStatus.APPROVED)) {
            RequestType requestType = labRequest.getRequestType();

            if (requestType.equals(RequestType.CREATE_LAB)) {
                CreateLabRequest dto = convertToDTO(labRequest.getChangePayload());
                labRequestRepo.save(labRequest); // persist APPROVED status first
                return labService.createLab(dto, labRequest.getRequestedBy().getEmail());

            } else if (requestType.equals(RequestType.UPDATE_LAB)) {
                Long labId = labRequest.getLabId();
                CreateLabRequest dto = convertToDTO(labRequest.getChangePayload());
                labRequestRepo.save(labRequest); // persist APPROVED status first
                return labService.updateLab(labId, dto, labRequest.getRequestedBy().getEmail());

            } else if (requestType.equals(RequestType.DELETE_LAB)) {
                Long labId = labRequest.getLabId();
                labRequestRepo.save(labRequest); // persist APPROVED status first
                return labService.deleteLab(labId, labRequest.getRequestedBy().getEmail());
            }
        }

        // REJECTED path
        labRequestRepo.save(labRequest);
        return ResponseEntity.ok(toResponse(labRequest));
    }

    // ── Admin: list all requests ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LabRequestResponse> getAllRequests(String statusFilter) {
        List<LabRequest> requests;
        if (statusFilter != null && !statusFilter.isBlank()) {
            RequestStatus status = RequestStatus.valueOf(statusFilter.toUpperCase());
            requests = labRequestRepo.findAllByRequestStatus(status);
        } else {
            requests = labRequestRepo.findAllByOrderByCreatedAtDesc();
        }
        return requests.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Lab owner: list own requests ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LabRequestResponse> getOwnerRequests(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return labRequestRepo
                .findAllByRequestedByIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
