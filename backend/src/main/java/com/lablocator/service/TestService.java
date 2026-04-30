package com.lablocator.service;

import com.lablocator.dto.test.CreateTestRequest;
import com.lablocator.dto.test.GetAllTestsResponse;
import com.lablocator.exceptions.BadRequestException;
import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.Test;
import com.lablocator.repository.TestRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TestService {
    @Autowired
    private TestRepo testRepo;

    public List<GetAllTestsResponse> getAllTests() {
        List<Test> tests = testRepo.findAll();
        List<GetAllTestsResponse> res = new ArrayList<>();

        for (Test test : tests) {
            res.add(new GetAllTestsResponse(
                    test.getId(),
                    test.getName(),
                    test.getDescription()
            ));
        }

        return res;
    }

    public GetAllTestsResponse createTest(CreateTestRequest req) {
        if (testRepo.existsByNameIgnoreCase(req.name().trim())) {
            throw new BadRequestException("A test named '" + req.name() + "' already exists.");
        }

        Test test = new Test();
        test.setName(req.name().trim());
        test.setDescription(req.description());
        Test saved = testRepo.save(test);

        return new GetAllTestsResponse(saved.getId(), saved.getName(), saved.getDescription());
    }

    public void deleteTest(Long id) {
        Test test = testRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with id: " + id));
        testRepo.delete(test);
    }
}

