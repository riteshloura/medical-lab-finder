package com.lablocator.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.lablocator.exceptions.BadRequestException;
import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.BookingTest;
import com.lablocator.model.Report;
import com.lablocator.model.User;
import com.lablocator.repository.BookingTestRepo;
import com.lablocator.repository.ReportRepo;
import com.lablocator.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Autowired
    private ReportRepo reportRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private BookingTestRepo bookingTestRepo;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadReport(MultipartFile file, Long bookingTestId, String email) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file provided for upload");
        }

        User labOwner = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BookingTest bookingTest = bookingTestRepo.findById(bookingTestId)
                .orElseThrow(() -> new ResourceNotFoundException("BookingTest", bookingTestId));

        // Preserve the original file extension so that Cloudinary's secure_url
        // ends with e.g. ".pdf" or ".jpg" and browsers infer the correct content-type.
        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.lastIndexOf('.') > 0) {
            ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "folder", "lab_reports",
                            "public_id", "booking_" + bookingTestId + ext));

            String reportURI = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();
            Report report = new Report();
            report.setReportURI(reportURI);
            report.setUploadedBy(labOwner);
            report.setBookingTest(bookingTest);
            report.setPublicId(publicId);
            reportRepo.save(report);

            return reportURI;

        } catch (IOException e) {
            throw new BadRequestException("Failed to read uploaded file: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage(), e);
        }
    }

    public String deleteReport(Long reportId, String email) {
        Report report = reportRepo.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", reportId));

        try {
            cloudinary.uploader().destroy(
                    report.getPublicId(),
                    ObjectUtils.asMap("resource_type", "raw"));
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file from Cloudinary: " + e.getMessage(), e);
        }

        reportRepo.delete(report);
        return "Report deleted successfully";
    }
}