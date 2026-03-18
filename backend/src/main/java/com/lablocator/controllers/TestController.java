package com.lablocator.controllers;

import com.lablocator.dto.test.GetAllTestsResponse;
import com.lablocator.repository.TestRepo;
import com.lablocator.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TestController {
    @Autowired
    private TestService testService;

    @GetMapping("/tests")
    public ResponseEntity<List<GetAllTestsResponse>> getAllTests() {
        return ResponseEntity.ok(testService.getAllTests());
    }
}
