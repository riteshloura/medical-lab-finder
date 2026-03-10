package com.lablocator.service;

import com.lablocator.model.User;
import com.lablocator.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepo userRepo;

    public ResponseEntity<?> getUser(Long id) {
        return ResponseEntity.ok(userRepo.findById(id));
    }
}
