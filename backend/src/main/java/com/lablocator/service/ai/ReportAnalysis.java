package com.lablocator.service.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Strongly-typed DTO that mirrors the structured JSON Gemini returns.
 * <p>
 * Fields are intentionally permissive (nullable) so that partial responses
 * still deserialise cleanly.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ReportAnalysis(

        @JsonProperty("patientSummary")
        String patientSummary,           // Plain-English overview a patient can understand

        @JsonProperty("keyFindings")
        List<Finding> keyFindings,       // Each test/marker result, annotated with status

        @JsonProperty("abnormalFindings")
        List<AbnormalFinding> abnormalFindings,  // Values outside the normal range

        @JsonProperty("riskLevel")
        String riskLevel,                // "Normal" | "Borderline" | "Abnormal" | "Critical"

        @JsonProperty("suggestions")
        List<String> suggestions,        // Lifestyle / follow-up recommendations

        @JsonProperty("followUpTests")
        List<String> followUpTests,      // Tests that should be repeated or added

        @JsonProperty("disclaimer")
        String disclaimer                // Always-present medical disclaimer
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Finding(
            @JsonProperty("name")        String name,
            @JsonProperty("value")       String value,
            @JsonProperty("unit")        String unit,
            @JsonProperty("normalRange") String normalRange,
            @JsonProperty("status")      String status   // "Normal" | "High" | "Low" | "Critical"
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AbnormalFinding(
            @JsonProperty("marker")      String marker,
            @JsonProperty("value")       String value,
            @JsonProperty("concern")     String concern,
            @JsonProperty("severity")    String severity  // "Mild" | "Moderate" | "Severe"
    ) {}
}
