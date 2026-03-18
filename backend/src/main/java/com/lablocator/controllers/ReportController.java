package com.lablocator.controllers;

import com.lablocator.dto.report.GetReportsResponse;
import com.lablocator.service.CloudinaryService;
import com.lablocator.service.ReportService;
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
    private ReportService reportService;

    @GetMapping("/booking/{bookingTestId}/reports")
    public List<GetReportsResponse> getReports(@PathVariable Long bookingTestId) {
        return reportService.getReports(bookingTestId);
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @PostMapping("/booking/{bookingTestId}/reports/upload")
    public ResponseEntity<String> uploadReport(@RequestParam("file") MultipartFile file,
                                               @PathVariable Long bookingTestId,
                                               Authentication authentication) {
        return ResponseEntity.ok(cloudinaryService.uploadReport(file, bookingTestId, authentication.getName()));
    }

    @PreAuthorize("hasRole('LAB_OWNER')")
    @DeleteMapping("/booking/reports/{reportId}")
    public ResponseEntity<String> deleteReport(@PathVariable Long reportId,
                                               Authentication authentication) {
        return ResponseEntity.ok(cloudinaryService.deleteReport(reportId, authentication.getName()));
    }
}
