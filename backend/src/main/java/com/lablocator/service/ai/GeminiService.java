package com.lablocator.service.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {
    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String analyzeReport(String reportText) {

        String url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        String prompt = """
                You are a medical assistant.

                Analyze the following lab report and:
                1. Summarize it in simple terms
                2. Highlight abnormal findings
                3. Suggest follow-up tests

                Return response in JSON:
                {
                  "summary": "...",
                  "abnormalFindings": "...",
                  "suggestions": "..."
                }

                Report:
                """ + reportText;

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        ResponseEntity<Map> response =
                restTemplate.postForEntity(url, body, Map.class);

        return extractTextFromResponse(response.getBody());
    }

    private String extractTextFromResponse(Map response) {
        try {
            List candidates = (List) response.get("candidates");
            Map first = (Map) candidates.get(0);
            Map content = (Map) first.get("content");
            List parts = (List) content.get("parts");
            Map textPart = (Map) parts.get(0);

            return (String) textPart.get("text");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response");
        }
    }
}
