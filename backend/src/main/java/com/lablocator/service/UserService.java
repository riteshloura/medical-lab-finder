package com.lablocator.service;

import com.lablocator.dto.user.GetUserResponse;
import com.lablocator.dto.user.UpdateUserRequest;
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

    public GetUserResponse updateUser(Long id, UpdateUserRequest req) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setName(req.name());

        User updatedUser = userRepo.save(user);
        
        return new GetUserResponse(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getIsVerified(),
                updatedUser.getRole(),
                updatedUser.getCreatedAt()
        );
    }

    public void deleteUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userRepo.delete(user);
    }
}
