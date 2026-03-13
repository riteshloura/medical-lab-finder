package com.lablocator.service;

import com.lablocator.dto.auth.LoginRequest;
import com.lablocator.dto.auth.LoginResponse;
import com.lablocator.dto.auth.RegisterRequest;
import com.lablocator.model.Role;
import com.lablocator.model.User;
import com.lablocator.repository.UserRepo;
import com.lablocator.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private AuthenticationManager authenticationManager;

    public String registerUser(@RequestBody RegisterRequest req) {
        if (userRepo.findByEmail(req.email()).isPresent()) {
            System.out.println("User already exists");
            throw new RuntimeException("User already exists");
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
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.email(),
                        req.password()
                )
        );

        User user = userRepo.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("Invalid Credentials"));

//        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
//            throw new RuntimeException("Invalid Credentials");
//        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(
                user.getName(),
                user.getId().toString(),
                token
        );
    }
}
