package com.lablocator.service;

import com.lablocator.dto.report.GetReportsResponse;
import com.lablocator.model.Report;
import com.lablocator.repository.ReportRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReportService {
    @Autowired
    private ReportRepo  reportRepo;

    public List<GetReportsResponse> getReports(Long bookingTestId) {
        List<Report> reports =  reportRepo.findByBookingTestId(bookingTestId);
        List<GetReportsResponse> res = new ArrayList<>();

        for(Report report:reports){
            res.add(new GetReportsResponse(
                    report.getId(),
                    report.getReportURI()
            ));
        }

        return res;
    }
}
