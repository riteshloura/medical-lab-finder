package com.lablocator.controllers;

import com.lablocator.dto.lab.CreateLabRequest;
import com.lablocator.model.Lab;
import com.lablocator.service.LabService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LabController {
    @Autowired
    private LabService labService;

    @GetMapping("/labs")
    public ResponseEntity<List<Lab>> getAllLabs() {
        return ResponseEntity.ok(labService.getAllLabs());
    }

    @GetMapping("/labs/{id}")
    public Lab getLabById(@PathVariable Long id) {
        return labService.getLabById(id);
    }

    @GetMapping("/labs?city={val}")
    public ResponseEntity<List<Lab>> getLabsByCity(@PathVariable String val) {
        return ResponseEntity.ok(labService.getLabsByCity(val));
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @PostMapping("/labs")
    public ResponseEntity<?> createLab(@Valid @RequestBody CreateLabRequest lab,
                                       Authentication authentication) {
        return labService.createLab(lab, authentication.getName());
    }
}
