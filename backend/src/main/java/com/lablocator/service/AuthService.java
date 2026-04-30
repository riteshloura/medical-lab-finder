package com.lablocator.service;

import com.lablocator.dto.auth.LoginRequest;
import com.lablocator.dto.auth.LoginResponse;
import com.lablocator.dto.auth.RegisterRequest;
import com.lablocator.dto.auth.RegisterResponse;
import com.lablocator.exceptions.BadRequestException;
import com.lablocator.exceptions.ConflictException;
import com.lablocator.exceptions.EmailSendException;
import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.Role;
import com.lablocator.model.User;
import com.lablocator.repository.UserRepo;
import com.lablocator.security.JwtService;
import com.lablocator.service.email.EmailService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired
    private UserRepo userRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private EmailService emailService;

    public RegisterResponse registerUser(RegisterRequest req) {
        if (userRepo.findByEmail(req.email()).isPresent()) {
            throw new ConflictException("An account with email '" + req.email() + "' already exists");
        }

        try {
            Role.valueOf(req.role());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role: '" + req.role() + "'. Allowed values: USER, LAB_OWNER");
        }

        User user = new User();
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setName(req.name());
        user.setRole(Role.valueOf(req.role()));
        user.setIsVerified(false);
        userRepo.save(user);

        boolean emailSent = true;
        try {
            sendVerificationMail(user);
        } catch (EmailSendException ex) {
            emailSent = false;
            log.warn("Failed to send verification email to {}: {}", user.getEmail(), ex.getMessage());
        }

        String message = emailSent
                ? "Account created. Please check your email to verify your account."
                : "Account created, but we could not send the verification email. Please try again later.";

        return new RegisterResponse(message, emailSent);
    }

    public RegisterResponse registerAdmin(RegisterRequest req) {
        // Enforce single-admin rule
        if (userRepo.existsByRole(Role.ADMIN)) {
            throw new ConflictException("An admin account already exists. Only one admin is allowed.");
        }

        if (userRepo.findByEmail(req.email()).isPresent()) {
            throw new ConflictException("An account with email '" + req.email() + "' already exists");
        }

        User admin = new User();
        admin.setEmail(req.email());
        admin.setPassword(passwordEncoder.encode(req.password()));
        admin.setName(req.name());
        admin.setRole(Role.ADMIN);
        admin.setIsVerified(true); // No email verification for admin
        userRepo.save(admin);

        return new RegisterResponse("Admin account created successfully.", true);
    }

    public LoginResponse loginUser(LoginRequest req) {
        // authenticationManager throws BadCredentialsException (handled by
        // GlobalExceptionHandler → 401)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        User user = userRepo.findByEmail(req.email())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        // null-safe: treat null as unverified (covers users created before this
        // feature)
        if (!Boolean.TRUE.equals(user.getIsVerified()) && user.getRole().equals(Role.USER)) {
            throw new BadRequestException("Please verify your email before logging in");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(
                user.getName(),
                user.getId().toString(),
                token,
                user.getEmail(),
                user.getRole().name());
    }

    public void sendVerificationMail(User user) {
        String token = jwtService.generateEmailVerificationToken(user.getEmail());

        // Link points to the FRONTEND verify-email page, not the backend API
        String link = frontendUrl + "/verify-email?token=" + token;

        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
                    <h2 style="color: #059669;">Verify Your Email — LabLocator</h2>
                    <p>Hi %s,</p>
                    <p>Thanks for signing up! Please click the button below to verify your email address and activate your account.</p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="%s"
                           style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #059669, #0d9488); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                           Verify Email
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">This link expires in <strong>24 hours</strong>. If you did not create an account, you can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="color: #9ca3af; font-size: 12px;">LabLocator — Find Affordable Healthcare Near You</p>
                </div>
                """
                .formatted(user.getName(), link);

        emailService.sendHtmlMail(user.getEmail(), "Verify Your Email - LabLocator", html, "LabLocator");
    }

    public String resendVerification(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email '" + email + "'"));

        if (Boolean.TRUE.equals(user.getIsVerified())) {
            return "Email is already verified. You can log in directly.";
        }

        try {
            sendVerificationMail(user);
        } catch (EmailSendException ex) {
            log.warn("Failed to resend verification email to {}: {}", email, ex.getMessage());
            throw new BadRequestException("Could not send verification email. Please try again later.");
        }

        return "Verification email sent. Please check your inbox.";
    }

    public String forgotPassword(String email) {
        // We find the user but always return the same message to prevent email enumeration
        userRepo.findByEmail(email).ifPresent(user -> {
            String token = jwtService.generatePasswordResetToken(email);
            String link = frontendUrl + "/reset-password?token=" + token;

            String html = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
                        <h2 style="color: #059669;">Reset Your Password — LabLocator</h2>
                        <p>Hi %s,</p>
                        <p>We received a request to reset your LabLocator account password. Click the button below to choose a new password.</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="%s"
                               style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #059669, #0d9488); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                               Reset Password
                            </a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="color: #9ca3af; font-size: 12px;">LabLocator — Find Affordable Healthcare Near You</p>
                    </div>
                    """.formatted(user.getName(), link);

            try {
                emailService.sendHtmlMail(email, "Reset Your Password - LabLocator", html, "LabLocator");
            } catch (EmailSendException ex) {
                log.warn("Failed to send password reset email to {}: {}", email, ex.getMessage());
                // Don't rethrow — keep the response vague
            }
        });

        return "If an account with that email exists, a password reset link has been sent.";
    }

    public String resetPassword(String token, String newPassword) {
        String email;
        Claims claims;

        try {
            claims = jwtService.extractAllClaims(token);
            email = claims.getSubject();

            if (!"PASSWORD_RESET".equals(claims.get("type"))) {
                throw new BadRequestException("Invalid token type");
            }
        } catch (ExpiredJwtException e) {
            throw new BadRequestException("Reset link has expired. Please request a new one.");
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Invalid or malformed reset token.");
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        // Ensure account is marked verified when resetting password (implies ownership of email)
        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            user.setIsVerified(true);
        }
        userRepo.save(user);

        return "Password reset successfully! You can now log in with your new password.";
    }

    public String verifyEmail(String token) {
        String email;
        Claims claims;

        try {
            claims = jwtService.extractAllClaims(token);
            email = claims.getSubject();

            // ✅ Check token type
            if (!"EMAIL_VERIFICATION".equals(claims.get("type"))) {
                throw new BadRequestException("Invalid token type");
            }

        } catch (ExpiredJwtException e) {
            throw new BadRequestException("Verification link expired");
        } catch (Exception e) {
            throw new BadRequestException("Invalid verification token");
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getIsVerified()) {
            return "Email already verified";
        }

        user.setIsVerified(true);
        userRepo.save(user);

        return "Email verified successfully!";
    }
}
