package com.lablocator.service;

import com.lablocator.dto.auth.LoginRequest;
import com.lablocator.dto.auth.LoginResponse;
import com.lablocator.dto.auth.RegisterRequest;
import com.lablocator.exceptions.BadRequestException;
import com.lablocator.exceptions.ConflictException;
import com.lablocator.model.Role;
import com.lablocator.model.User;
import com.lablocator.repository.UserRepo;
import com.lablocator.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired private UserRepo userRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private AuthenticationManager authenticationManager;

    public String registerUser(RegisterRequest req) {
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
        userRepo.save(user);

        return "success";
    }

    public LoginResponse loginUser(LoginRequest req) {
        // authenticationManager throws BadCredentialsException (handled by GlobalExceptionHandler → 401)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        User user = userRepo.findByEmail(req.email())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        String token = jwtService.generateToken(user);
        return new LoginResponse(
                user.getName(),
                user.getId().toString(),
                token,
                user.getEmail(),
                user.getRole().name()
        );
    }
}
