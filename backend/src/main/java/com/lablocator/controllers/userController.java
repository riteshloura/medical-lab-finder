package com.lablocator.controllers;

import com.lablocator.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }
}
