package com.lablocator.service.ai;

/**
 * Thrown when report analysis fails for any reason – API error, parse failure, etc.
 * Extends RuntimeException so callers don't need to declare it, but the
 * GlobalExceptionHandler can catch and translate it to a clean HTTP 500.
 */
public class ReportAnalysisException extends RuntimeException {

    public ReportAnalysisException(String message) {
        super(message);
    }

    public ReportAnalysisException(String message, Throwable cause) {
        super(message, cause);
    }
}
