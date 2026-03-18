package com.lablocator.service;

import com.lablocator.dto.test.GetAllTestsResponse;
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
}
