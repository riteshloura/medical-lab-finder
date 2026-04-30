package com.lablocator.controllers;

import com.lablocator.dto.common.ApiMessage;
import com.lablocator.dto.test.CreateTestRequest;
import com.lablocator.dto.test.GetAllTestsResponse;
import com.lablocator.service.TestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TestController {
    @Autowired
    private TestService testService;

    @GetMapping("/tests")
    public ResponseEntity<List<GetAllTestsResponse>> getAllTests() {
        return ResponseEntity.ok(testService.getAllTests());
    }

    // ── Admin endpoints ──────────────────────────────────────────────────────

    @PostMapping("/admin/tests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GetAllTestsResponse> createTest(@Valid @RequestBody CreateTestRequest req) {
        return ResponseEntity.ok(testService.createTest(req));
    }

    @DeleteMapping("/admin/tests/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiMessage> deleteTest(@PathVariable Long id) {
        testService.deleteTest(id);
        return ResponseEntity.ok(new ApiMessage("Test deleted successfully."));
    }
}

