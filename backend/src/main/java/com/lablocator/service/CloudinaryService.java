package com.lablocator.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
    private UserRepo  userRepo;
    @Autowired
    private BookingTestRepo bookingTestRepo;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadReport(MultipartFile file, Long bookingTestId, String email) {
        try {
            User labOwner = userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            BookingTest bookingTest = bookingTestRepo.findById(bookingTestId)
                    .orElseThrow(() -> new RuntimeException("Booked test not found"));

            // Preserve the original file extension in the public_id so that
            // Cloudinary's secure_url ends with e.g. ".pdf" or ".jpg" and
            // browsers can infer the correct content-type when opening the link.
            String originalFilename = file.getOriginalFilename();
            String ext = "";
            if (originalFilename != null && originalFilename.lastIndexOf('.') > 0) {
                ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
            }

            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "folder", "lab_reports",
                            "public_id", "booking_" + bookingTestId + ext
                    )
            );

            String reportURI = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();
            Report report = new Report();
            report.setReportURI(reportURI);
            report.setUploadedBy(labOwner);
            report.setBookingTest(bookingTest);
            report.setPublicId(publicId);

            reportRepo.save(report);
            return reportURI;

        } catch (Exception e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    public String deleteReport(Long reportId, String email) {
        try {
            Report report = reportRepo.findById(reportId)
                    .orElseThrow(() -> new RuntimeException("Booked test not found"));

//            User user = userRepo.findByEmail(email)
//                    .orElseThrow(() -> new RuntimeException("User not found"));

            cloudinary.uploader().destroy(
                    report.getPublicId(),
                    ObjectUtils.asMap("resource_type", "raw")
            );

            reportRepo.delete(report);
            return "Report deleted successfully";

        } catch (Exception e) {
            throw new RuntimeException("Failed to delete report", e);
        }
    }
}