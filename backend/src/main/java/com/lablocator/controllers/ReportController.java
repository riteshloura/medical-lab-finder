package com.lablocator.controllers;

import com.lablocator.model.Report;
import com.lablocator.repository.ReportRepo;
import com.lablocator.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequestMapping("/api")
@RestController
public class ReportController {

    @Autowired
    private CloudinaryService cloudinaryService;
    @Autowired
    private ReportRepo reportRepo;

    @GetMapping("/booking/{bookingTestId}/reports")
    public List<Report> getReports(@PathVariable Long bookingTestId) {
        return reportRepo.findByBookingTestId(bookingTestId);
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @PostMapping("/booking/{bookingTestId}/reports/upload")
    public ResponseEntity<String> uploadReport(@RequestParam("file") MultipartFile file,
                                               @PathVariable Long bookingTestId,
                                               Authentication authentication) {
        return ResponseEntity.ok(cloudinaryService.uploadReport(file, bookingTestId, authentication.getName()));
    }
}
