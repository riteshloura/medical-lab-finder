package com.lablocator.service.ai;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;

@Service
public class PdfService {
    public String extractText(String fileUrl) {
        try (InputStream input = new URL(fileUrl).openStream()) {

            PDDocument document = PDDocument.load(input);
            PDFTextStripper stripper = new PDFTextStripper();

            String text = stripper.getText(document);

            if (text == null || text.trim().isEmpty()) {
                throw new RuntimeException("No readable text found in PDF");
            }

            return text;

        } catch (Exception e) {
            throw new RuntimeException("Failed to extract PDF text", e);
        }
    }
}
