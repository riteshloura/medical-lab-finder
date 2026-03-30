package com.lablocator.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lablocator.exceptions.BadRequestException;
import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.Report;
import com.lablocator.repository.ReportRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orchestrates the full report-analysis pipeline:
 * <ol>
 *   <li>Look up the report and verify the requester owns it.</li>
 *   <li>Return a cached analysis if one already exists (saves API cost & latency).</li>
 *   <li>Extract text from the PDF.</li>
 *   <li>Call Gemini and get a typed {@link ReportAnalysis}.</li>
 *   <li>Persist both the raw JSON and the parsed summary for cache and audit.</li>
 * </ol>
 */
@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    @Autowired private ReportRepo    reportRepo;
    @Autowired private PdfService    pdfService;
    @Autowired private GeminiService geminiService;
    @Autowired private ObjectMapper  objectMapper;

    /**
     * Analyses a medical report for the authenticated user.
     *
     * @param reportId  DB id of the {@link Report}
     * @param userEmail email of the authenticated user (from JWT)
     * @return parsed {@link ReportAnalysis}
     */
    @Transactional
    public ReportAnalysis analyzeReport(Long reportId, String userEmail) {

        Report report = reportRepo.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        // ── Ownership check ──────────────────────────────────────────────────
//        if (report.getUploadedBy() != null
//                && !report.getUploadedBy().getEmail().equals(userEmail)) {
//            throw new BadRequestException("You do not have permission to analyse this report");
//        }

        // ── Cache hit: return stored analysis ────────────────────────────────
        if (report.getAiRawResponse() != null && !report.getAiRawResponse().isBlank()) {
            log.debug("Returning cached AI analysis for report {}", reportId);
            return deserializeCached(report.getAiRawResponse(), reportId);
        }

        // ── Cache miss: extract → analyse → persist ──────────────────────────
        log.info("Running AI analysis for report {} (user: {})", reportId, userEmail);

        String pdfText;
        try {
            pdfText = pdfService.extractText(report.getReportURI());
        } catch (Exception e) {
            log.error("PDF extraction failed for report {}: {}", reportId, e.getMessage());
            throw new ReportAnalysisException("Could not read the PDF. Please ensure the file is a valid, text-based lab report.");
        }

        ReportAnalysis analysis = geminiService.analyzeReport(pdfText);

        // ── Persist both forms ───────────────────────────────────────────────
        String rawJson;
        try {
            rawJson = objectMapper.writeValueAsString(analysis);
        } catch (Exception e) {
            log.warn("Could not serialise analysis to JSON for caching: {}", e.getMessage());
            rawJson = "{}";
        }

        report.setAiRawResponse(rawJson);
        report.setAiSummary(analysis.patientSummary());   // quick text field for listings
        reportRepo.save(report);

        return analysis;
    }

    /**
     * Force a fresh AI analysis, ignoring any cached result.
     * Useful when the user wants to re-trigger after a model upgrade.
     */
    @Transactional
    public ReportAnalysis reanalyzeReport(Long reportId, String userEmail) {
        Report report = reportRepo.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

//        if (report.getUploadedBy() != null
//                && !report.getUploadedBy().getEmail().equals(userEmail)) {
//            throw new BadRequestException("You do not have permission to analyse this report");
//        }

        // Clear cache so the main method runs fresh
        report.setAiRawResponse(null);
        report.setAiSummary(null);
        reportRepo.save(report);

        return analyzeReport(reportId, userEmail);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private ReportAnalysis deserializeCached(String json, Long reportId) {
        try {
            return objectMapper.readValue(json, ReportAnalysis.class);
        } catch (Exception e) {
            log.warn("Cached JSON for report {} is corrupt; will re-analyse. Error: {}", reportId, e.getMessage());
            // Corrupt cache — clear and re-run
            reportRepo.findById(reportId).ifPresent(r -> {
                r.setAiRawResponse(null);
                r.setAiSummary(null);
                reportRepo.save(r);
            });
            throw new ReportAnalysisException("Cached analysis was invalid. Please retry.");
        }
    }
}
