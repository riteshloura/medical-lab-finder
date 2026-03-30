package com.lablocator.controllers;

import com.lablocator.service.ai.AIService;
import com.lablocator.service.ai.ReportAnalysis;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoints for AI-powered lab report analysis.
 *
 * <ul>
 *   <li>POST /api/ai/analyze/report/{reportId}         – analyse (cached if available)</li>
 *   <li>POST /api/ai/analyze/report/{reportId}/refresh – force a fresh analysis</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    /**
     * Analyse a report.
     * Returns the cached result if the report has already been analysed,
     * otherwise calls Gemini and caches the result.
     */
    @PostMapping("/analyze/report/{reportId}")
    public ResponseEntity<ReportAnalysis> analyzeReport(
            @PathVariable Long reportId,
            Authentication authentication
    ) {
        ReportAnalysis analysis = aiService.analyzeReport(reportId, authentication.getName());
        return ResponseEntity.ok(analysis);
    }

    /**
     * Force a fresh Gemini call, bypassing any cached analysis.
     * Useful when the user suspects the cached result is stale.
     */
    @PostMapping("/analyze/report/{reportId}/refresh")
    public ResponseEntity<ReportAnalysis> reanalyzeReport(
            @PathVariable Long reportId,
            Authentication authentication
    ) {
        ReportAnalysis analysis = aiService.reanalyzeReport(reportId, authentication.getName());
        return ResponseEntity.ok(analysis);
    }
}
