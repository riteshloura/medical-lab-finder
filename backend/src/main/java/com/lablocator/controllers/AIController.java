package com.lablocator.controllers;

import com.lablocator.service.ai.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/ai/analyze/report/{reportId}")
    public ResponseEntity<?> analyzeReport(
            @PathVariable Long reportId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(aiService.analyzeReport(reportId, authentication.getName()));
    }
}
