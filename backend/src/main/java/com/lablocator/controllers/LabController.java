package com.lablocator.controllers;

import com.lablocator.dto.lab.CreateLabRequest;
import com.lablocator.dto.lab.GetNearbyLabsResponse;
import com.lablocator.dto.lab.GetOwnersLabResponse;
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

    @GetMapping("/labs/nearby")
    public ResponseEntity<List<GetNearbyLabsResponse>> getNearbyLabs(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius
    ) {
        System.out.println("Latitude: " + lat);
        System.out.println("Longitude: " + lng);
        System.out.println("Radius: " + radius);
        return ResponseEntity.ok(labService.getNearbyLabs(lat, lng, radius));
    }

    @GetMapping("/labs/{id}")
    public Lab getLabById(@PathVariable Long id) {
        return labService.getLabById(id);
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @GetMapping("/labs/me")
    public ResponseEntity<List<GetOwnersLabResponse>> getOwnerLabs(Authentication authentication) {
        return ResponseEntity.ok(labService.getOwnerLabs(authentication.getName()));
    }

//    /labs/search?test={val}&&location={loc}
    @GetMapping("/labs/search")
    public ResponseEntity<List<Lab>> getLabsByTestAndLocation(
            @RequestParam String test,
            @RequestParam String location
            ) {
        return ResponseEntity.ok(labService.getLabsByTestAndLocation(test, location));
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @PostMapping("/labs")
    public ResponseEntity<?> createLab(@Valid @RequestBody CreateLabRequest lab,
                                       Authentication authentication) {
        return labService.createLab(lab, authentication.getName());
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @PutMapping("/labs/{id}")
    public ResponseEntity<?> updateLab(@PathVariable Long id,
                                       @Valid @RequestBody CreateLabRequest lab,
                                       Authentication authentication) {
        return labService.updateLab(id, lab, authentication.getName());
    }
}
