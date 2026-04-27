package com.lablocator.controllers;

import com.lablocator.dto.user.GetUserResponse;
import com.lablocator.dto.user.UpdateUserRequest;
import com.lablocator.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class userController {
    @Autowired
    private UserService userService;

    @GetMapping("/")
    public String home() {
        return "Hello World";
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<GetUserResponse> getUser(@PathVariable Long id) {
        return  ResponseEntity.ok(userService.getUser(id));
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest updateUserRequest ) {
        return ResponseEntity.ok(userService.updateUser(id, updateUserRequest));
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return  ResponseEntity.ok(Map.of("message", "User has been deleted"));
    }
}
