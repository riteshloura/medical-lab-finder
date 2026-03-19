package com.lablocator.service;

import com.lablocator.dto.lab.AddLabTestsRequest;
import com.lablocator.dto.lab.GetLabTestResponse;
import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.Lab;
import com.lablocator.model.LabTest;
import com.lablocator.model.Test;
import com.lablocator.repository.LabRepo;
import com.lablocator.repository.LabTestRepo;
import com.lablocator.repository.TestRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LabTestService {
    @Autowired
    private LabTestRepo labTestRepo;
    @Autowired
    private LabRepo labRepo;
    @Autowired
    private TestRepo testRepo;

    public List<GetLabTestResponse> getLabTests(Long labId) {
        List<GetLabTestResponse> response = new ArrayList<>();
        for (LabTest labTest : labTestRepo.findByLabId(labId)) {
            Test test = labTest.getTest();
            response.add(new GetLabTestResponse(
                    test.getName(),
                    test.getDescription(),
                    test.getId(),
                    labTest.getPrice(),
                    labTest.getHomeCollectionAvailable()));
        }
        return response;
    }

    public GetLabTestResponse addTestsToLab(Long labId, AddLabTestsRequest req) {
        Lab lab = labRepo.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab", labId));

        Test test = testRepo.findById(req.testId())
                .orElseThrow(() -> new ResourceNotFoundException("Test", req.testId()));

        LabTest labTest = new LabTest();
        labTest.setLab(lab);
        labTest.setTest(test);
        labTest.setPrice(req.price());
        labTest.setHomeCollectionAvailable(req.homeCollectionAvailable());
        labTest = labTestRepo.save(labTest);

        return new GetLabTestResponse(
                test.getName(),
                test.getDescription(),
                test.getId(),
                labTest.getPrice(),
                labTest.getHomeCollectionAvailable());
    }

    public String deleteTestsToLab(Long labId, Long testId) {
        int deleted = labTestRepo.deleteByTestId(labId, testId);
        if (deleted == 0) {
            throw new ResourceNotFoundException("Lab test not found for labId=" + labId + ", testId=" + testId);
        }
        return "Test deleted successfully";
    }
}
