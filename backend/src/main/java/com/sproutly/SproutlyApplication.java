package com.sproutly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Sproutly Spring Boot application.
 *
 * The @SpringBootApplication annotation enables:
 * - Component scanning
 * - Auto-configuration
 * - Spring Boot configuration support
 *
 * Running this class starts the embedded web server
 * and initializes the entire backend application.
 */
@SpringBootApplication
public class SproutlyApplication {

    /**
     * Starts the Spring Boot application.
     *
     * @param args command-line arguments passed during startup
     */
    public static void main(String[] args) {

        // Launch the Spring Boot application
        SpringApplication.run(SproutlyApplication.class, args);
    }
}