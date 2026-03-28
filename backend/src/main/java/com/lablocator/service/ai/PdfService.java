package com.lablocator.service.ai;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URI;
import java.net.URL;

/**
 * Extracts UTF-8 text from a PDF accessible at a given URL.
 *
 * <p>Improvements over the original:
 * <ul>
 *   <li>Explicit connection timeout so a stale Cloudinary URL doesn't hang indefinitely</li>
 *   <li>Normalises whitespace: collapses multiple consecutive blank lines / spaces that
 *       are common in lab-report PDFs and waste API tokens</li>
 *   <li>PDF document is properly closed via try-with-resources</li>
 * </ul>
 */
@Service
public class PdfService {

    private static final Logger log = LoggerFactory.getLogger(PdfService.class);

    /** Open/read timeout for fetching the PDF from Cloudinary (ms) */
    private static final int READ_TIMEOUT_MS    = 15_000;
    private static final int CONNECT_TIMEOUT_MS = 8_000;

    public String extractText(String fileUrl) {
        log.debug("Extracting text from PDF: {}", fileUrl);
        try {
            URL url = URI.create(fileUrl).toURL();

            java.net.URLConnection conn = url.openConnection();
            conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
            conn.setReadTimeout(READ_TIMEOUT_MS);

            try (InputStream input     = conn.getInputStream();
                 PDDocument document   = PDDocument.load(input)) {

                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);   // preserves table/column order

                String text = stripper.getText(document);

                if (text == null || text.isBlank()) {
                    throw new ReportAnalysisException(
                            "No readable text found in the PDF. "
                            + "The report may be a scanned image — please upload a text-based PDF.");
                }

                return normalise(text);
            }
        } catch (ReportAnalysisException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to extract PDF text from {}: {}", fileUrl, e.getMessage(), e);
            throw new ReportAnalysisException("Failed to read the report PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Removes excessive whitespace to avoid wasting API tokens on blank lines
     * and repeated spaces that are common in lab-report PDFs.
     */
    private String normalise(String text) {
        // Collapse 3+ consecutive newlines → 2
        String cleaned = text.replaceAll("\\r\\n", "\n")
                             .replaceAll("[ \\t]+", " ")
                             .replaceAll("\n{3,}", "\n\n")
                             .strip();
        log.debug("PDF extracted {} chars (normalised from {})", cleaned.length(), text.length());
        return cleaned;
    }
}
