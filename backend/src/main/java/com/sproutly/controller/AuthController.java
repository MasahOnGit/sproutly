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

/**
 * Controller responsible for user authentication and session management.
 *
 * This controller handles:
 *   - User registration
 *   - User login
 *   - User logout
 *   - Retrieving the currently authenticated user
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * Repository used to access and manage users in the database.
     */
    @Autowired
    private UserRepository userRepository;

    /**
     * Spring Security authentication manager used for login authentication.
     */
    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * Password encoder used to hash passwords before saving them.
     */
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Registers a new user account.
     *
     * This endpoint:
     *   - Checks if the email already exists
     *   - Encrypts the user's password using BCrypt
     *   - Saves the user in the database
     *
     * @param user user data received from the frontend
     * @return success message or error if the email already exists
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        // Check if another account already uses this email
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already exists"));
        }

        // Encrypt the password before storing it in the database
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save the new user
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Account created"));
    }

    /**
     * Logs a user into the application.
     *
     * This endpoint:
     *   - Authenticates the email and password
     *   - Creates a Spring Security session
     *   - Stores the security context in the HTTP session
     *   - Returns basic user information
     *
     * @param user login credentials from the frontend
     * @param request current HTTP request
     * @return authenticated user data or an error message
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpServletRequest request) {

        try {

            // Attempt to authenticate the user using email and password
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            user.getPassword()
                    )
            );

            // Create a new Spring Security context
            var context = org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();

            // Store the authenticated user inside the security context
            context.setAuthentication(authentication);

            // Set the context globally for the current request
            org.springframework.security.core.context.SecurityContextHolder.setContext(context);

            // Save the security context into the user's HTTP session
            request.getSession(true).setAttribute(
                    "SPRING_SECURITY_CONTEXT",
                    context
            );

            // Retrieve the full user from the database
            User foundUser = userRepository.findByEmail(user.getEmail())
                    .orElseThrow();

            // Return selected user information to the frontend
            return ResponseEntity.ok(Map.of("user", Map.of(
                    "id", foundUser.getId(),
                    "displayName", foundUser.getDisplayName(),
                    "email", foundUser.getEmail()
            )));

        } catch (Exception e) {

            // Authentication failed
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid credentials"));
        }
    }

    /**
     * Logs the current user out of the application.
     *
     * This invalidates the current HTTP session,
     * removing the user's authentication data.
     *
     * @param session current user session
     * @return logout success message
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {

        // Destroy the user's session
        session.invalidate();

        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    /**
     * Returns information about the currently authenticated user.
     *
     * This endpoint checks whether a valid authenticated session exists.
     * If the user is logged in, their account details are returned.
     *
     * @param auth Spring Security authentication object
     * @return current user information or unauthorized response
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {

        // Check if the user is authenticated
        if (auth == null ||
                !auth.isAuthenticated() ||
                auth.getName().equals("anonymousUser")) {

            return ResponseEntity.status(401)
                    .body(Map.of("message", "Not logged in"));
        }

        // Find the logged-in user by email
        User foundUser = userRepository.findByEmail(auth.getName())
                .orElseThrow();

        // Return the current user's information
        return ResponseEntity.ok(Map.of("user", Map.of(
                "id", foundUser.getId(),
                "displayName", foundUser.getDisplayName(),
                "email", foundUser.getEmail()
        )));
    }
}