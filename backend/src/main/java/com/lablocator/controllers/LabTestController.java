package com.lablocator.controllers;

import com.lablocator.dto.lab.AddLabTestsRequest;
import com.lablocator.dto.lab.GetLabTestResponse;
import com.lablocator.model.LabTest;
import com.lablocator.service.LabTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
//@PreAuthorize("hasRole('LAB_OWNER')")
public class LabTestController {
    @Autowired
    private LabTestService labTestService;

    @PreAuthorize("hasAnyRole('USER','LAB_OWNER')")
    @GetMapping("/labs/{labId}/tests")
    public ResponseEntity<List<GetLabTestResponse>> getLabTests(@PathVariable Long labId) {
        return ResponseEntity.ok(labTestService.getLabTests(labId));
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @PostMapping("/labs/{labId}/tests")
    public ResponseEntity<GetLabTestResponse> createLabTest(@PathVariable Long labId, @RequestBody AddLabTestsRequest labTest) {
        return ResponseEntity.ok(labTestService.addTestsToLab(labId, labTest));
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @DeleteMapping("/labs/{labId}/tests/{testId}")
    public ResponseEntity<?> deleteLabTest(@PathVariable Long labId, @PathVariable Long testId) {
        return ResponseEntity.ok(labTestService.deleteTestsToLab(labId, testId));
    }
}
