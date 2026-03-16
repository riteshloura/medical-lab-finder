package com.lablocator.service;

import com.lablocator.dto.lab.AddLabTestsRequest;
import com.lablocator.dto.lab.GetLabTestResponse;
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
        List<LabTest> labTests = labTestRepo.findByLabId(labId);
//        System.out.println(labTests);

        List<GetLabTestResponse> response = new ArrayList<>();

        for (LabTest labTest : labTests) {

            Test test = labTest.getTest();

            response.add(new GetLabTestResponse(
                    test.getName(),
                    test.getDescription(),
                    test.getId(),
                    labTest.getPrice(),
                    labTest.getHomeCollectionAvailable()
            ));
        }

        return response;
    }

    public GetLabTestResponse addTestsToLab(Long labId, AddLabTestsRequest req) {
        Lab lab = labRepo.findById(labId)
                .orElseThrow(() -> new RuntimeException("Lab not found"));

        Test test = testRepo.findById(req.testId())
                .orElseThrow(() -> new RuntimeException("Test not found"));

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
                labTest.getHomeCollectionAvailable()
        );
    }

    public String deleteTestsToLab(Long labId, Long testId) {
        int deleted = labTestRepo.deleteByTestId(labId, testId);

        if (deleted == 0) {
            throw new RuntimeException("LabTest not found");
        }

        return "Test deleted successfully";
    }
}
