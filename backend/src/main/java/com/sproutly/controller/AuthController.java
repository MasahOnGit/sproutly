package com.sproutly.controller;

import com.sproutly.entity.User;
import com.sproutly.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Account created"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpServletRequest request) {
        try {
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );

            var context = org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            org.springframework.security.core.context.SecurityContextHolder.setContext(context);

            request.getSession(true).setAttribute(
                    "SPRING_SECURITY_CONTEXT",
                    context
            );

            User foundUser = userRepository.findByEmail(user.getEmail()).orElseThrow();

            return ResponseEntity.ok(Map.of("user", Map.of(
                    "id", foundUser.getId(),
                    "displayName", foundUser.getDisplayName(),
                    "email", foundUser.getEmail()
            )));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

   @GetMapping("/me")
   public ResponseEntity<?> me(Authentication auth) {
       if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
           return ResponseEntity.status(401).body(Map.of("message", "Not logged in"));
       }

       User foundUser = userRepository.findByEmail(auth.getName()).orElseThrow();

       return ResponseEntity.ok(Map.of("user", Map.of(
               "id", foundUser.getId(),
               "displayName", foundUser.getDisplayName(),
               "email", foundUser.getEmail()
       )));
   }
}