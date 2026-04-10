package com.lablocator.service;

import com.lablocator.dto.user.GetUserResponse;
import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.User;
import com.lablocator.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepo userRepo;

    public GetUserResponse getUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));


        return new GetUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getIsVerified(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
