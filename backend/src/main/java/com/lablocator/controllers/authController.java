package com.lablocator.controllers;

import com.lablocator.dto.auth.LoginRequest;
import com.lablocator.dto.auth.LoginResponse;
import com.lablocator.dto.auth.RegisterRequest;
import com.lablocator.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class authController {
    @Autowired
    AuthService authService;

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest req) {
        return authService.registerUser(req);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.loginUser(req);
    }
}
