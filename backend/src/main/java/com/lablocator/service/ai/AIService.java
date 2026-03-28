package com.lablocator.service.ai;

import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.Report;
import com.lablocator.repository.ReportRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AIService {

    @Autowired
    private ReportRepo reportRepo;
    @Autowired
    private PdfService pdfService;
    @Autowired
    private GeminiService geminiService;

    public Object analyzeReport(Long reportId, String email) {
        Report report = reportRepo.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

//        if(!report.getUploadedBy().getEmail().equals(email)) {
//            throw new ResourceNotFoundException("User not found");
//        }

        if (report.getAiSummary() != null) {
            return report.getAiSummary();
        }

        // Extract text
        String text = pdfService.extractText(report.getReportURI());

        // AI call
//        String aiResponse = geminiService.analyzeReport(text);
        String aiResponse;

        try {
            aiResponse = geminiService.analyzeReport(text);
        } catch (Exception e) {
//            return "AI analysis failed. Please try again later.";
            e.printStackTrace();
            throw new RuntimeException(e);
        }

        // Save result (IMPORTANT)
        report.setAiSummary(aiResponse);
        reportRepo.save(report);

        return aiResponse;
    }
}
