package com.lablocator.controllers;

import com.lablocator.dto.admin.LabRequestResponse;
import com.lablocator.dto.admin.UpdateLabRequestStatusReq;
import com.lablocator.dto.lab.CreateLabRequest;
import com.lablocator.service.LabRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LabRequestController {

    @Autowired
    LabRequestService labRequestService;

    // ── Lab owner: submit requests ─────────────────────────────────────────────

    @PreAuthorize("hasRole('LAB_OWNER')")
    @PostMapping("/lab-request/create")
    public ResponseEntity<LabRequestResponse> createLabRequest(
            @RequestBody CreateLabRequest labRequest,
            Authentication authentication) {
        return ResponseEntity.ok(labRequestService.createLabRequest(labRequest, authentication.getName()));
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @PostMapping("/lab-request/{labId}/update")
    public ResponseEntity<LabRequestResponse> updateLabRequest(
            @PathVariable Long labId,
            @RequestBody CreateLabRequest labRequest,
            Authentication authentication) {
        return ResponseEntity.ok(labRequestService.updateLabRequest(labId, labRequest, authentication.getName()));
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @PostMapping("/lab-request/{labId}/delete")
    public ResponseEntity<LabRequestResponse> deleteLabRequest(
            @PathVariable Long labId,
            Authentication authentication) {
        return ResponseEntity.ok(labRequestService.deleteLabRequest(labId, authentication.getName()));
    }

    // ── Lab owner: view own requests ───────────────────────────────────────────

    @PreAuthorize("hasRole('LAB_OWNER')")
    @GetMapping("/lab-request/my")
    public ResponseEntity<List<LabRequestResponse>> getMyRequests(Authentication authentication) {
        return ResponseEntity.ok(labRequestService.getOwnerRequests(authentication.getName()));
    }

    // ── Admin: view & action all requests ─────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/lab-requests")
    public ResponseEntity<List<LabRequestResponse>> getAllRequests(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(labRequestService.getAllRequests(status));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/lab-request/{reqId}/updateStatus")
    public ResponseEntity<?> updateLabRequestStatus(
            @PathVariable Long reqId,
            @RequestBody UpdateLabRequestStatusReq req,
            Authentication authentication) {
        return labRequestService.updateLabRequestStatus(reqId, req, authentication.getName());
    }
}
