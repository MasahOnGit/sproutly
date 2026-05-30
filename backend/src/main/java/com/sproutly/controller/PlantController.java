package com.sproutly.controller;

import com.sproutly.entity.Plant;
import com.sproutly.entity.User;
import com.sproutly.repository.PlantRepository;
import com.sproutly.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller responsible for managing user plants.
 *
 * This controller allows authenticated users to:
 * - View their saved plants
 * - Add new plants
 * - Mark plants as watered
 * - Delete plants
 */
@RestController
@RequestMapping("/api/plants")
public class PlantController {

    /**
     * Repository used to manage plant data.
     */
    @Autowired
    private PlantRepository plantRepository;

    /**
     * Repository used to retrieve authenticated users.
     */
    @Autowired
    private UserRepository userRepository;

    /**
     * Returns all plants belonging to the currently authenticated user.
     *
     * @param auth authenticated user information
     * @return list of plants owned by the user
     */
    @GetMapping
    public List<Plant> getPlants(Authentication auth) {

        // Find all plants linked to the logged-in user
        return plantRepository.findByUserId(getUserId(auth));
    }

    /**
     * Creates a new plant for the authenticated user.
     *
     * Default values are applied if:
     * - lastWatered is missing
     * - wateringIntervalDays is missing
     *
     * @param plant plant data from the frontend
     * @param auth authenticated user information
     * @return saved plant
     */
    @PostMapping
    public Plant createPlant(@RequestBody Plant plant, Authentication auth) {

        // Assign the plant to the current user
        plant.setUserId(getUserId(auth));

        // If no watering date is provided, use today's date
        if (plant.getLastWatered() == null) {
            plant.setLastWatered(LocalDate.now());
        }

        // If no watering interval is provided, default to 7 days
        if (plant.getWateringIntervalDays() == null) {
            plant.setWateringIntervalDays(7);
        }

        // Save the plant to the database
        return plantRepository.save(plant);
    }

    /**
     * Updates a plant's last watered date to today.
     *
     * Only the owner of the plant can perform this action.
     *
     * @param id plant ID
     * @param auth authenticated user information
     * @return updated plant
     */
    @PatchMapping("/{id}/water")
    public Plant waterPlant(@PathVariable Long id, Authentication auth) {

        // Find the plant by ID
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plant not found"));

        // Ensure the plant belongs to the logged-in user
        if (!plant.getUserId().equals(getUserId(auth))) {
            throw new RuntimeException("Unauthorized");
        }

        // Update the watering date
        plant.setLastWatered(LocalDate.now());

        // Save updated plant
        return plantRepository.save(plant);
    }

    /**
     * Deletes a plant from the database.
     *
     * Only the owner of the plant can delete it.
     *
     * @param id plant ID
     * @param auth authenticated user information
     * @return HTTP response indicating success or failure
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlant(@PathVariable Long id, Authentication auth) {

        // Find the plant by ID
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plant not found"));

        // Ensure the plant belongs to the logged-in user
        if (!plant.getUserId().equals(getUserId(auth))) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Unauthorized"));
        }

        // Delete the plant
        plantRepository.delete(plant);

        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves the database ID of the authenticated user.
     *
     * Spring Security stores the user's email as the authentication name.
     *
     * @param auth authenticated user information
     * @return authenticated user's database ID
     */
    private Long getUserId(Authentication auth) {

        // Get the logged-in user's email
        String email = auth.getName();

        // Find the user in the database
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getId();
    }
}