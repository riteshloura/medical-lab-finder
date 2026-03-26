package com.lablocator.controllers;

import com.lablocator.dto.auth.*;
import com.lablocator.dto.common.ApiMessage;
import com.lablocator.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/auth")
public class authController {
    @Autowired
    AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.registerUser(req));
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.loginUser(req);
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiMessage> verifyToken(@RequestParam String token) {
        return ResponseEntity.ok(new ApiMessage(authService.verifyEmail(token)));
    }

//    public record ResendVerificationRequest(
//            @NotBlank(message = "Email is required")
//            @Email(message = "Invalid email format")
//            String email
//    ) {}

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiMessage> resendVerification(@Valid @RequestBody ResendVerificationRequest req) {
        return ResponseEntity.ok(new ApiMessage(authService.resendVerification(req.email())));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiMessage> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        return ResponseEntity.ok(new ApiMessage(authService.forgotPassword(req.email())));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiMessage> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        return ResponseEntity.ok(new ApiMessage(authService.resetPassword(req.token(), req.newPassword())));
    }
}
