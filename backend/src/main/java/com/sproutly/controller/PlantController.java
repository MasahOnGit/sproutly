package com.sproutly.controller;

import com.sproutly.entity.Plant;
import com.sproutly.entity.User;
import com.sproutly.repository.PlantRepository;
import com.sproutly.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/plants")
public class PlantController {

    @Autowired
    private PlantRepository plantRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Plant> getPlants(Authentication auth) {
        return plantRepository.findByUserId(getUserId(auth));
    }

    @PostMapping
    public Plant createPlant(@RequestBody Plant plant, Authentication auth) {
        plant.setUserId(getUserId(auth));

        if (plant.getLastWatered() == null) {
            plant.setLastWatered(LocalDate.now());
        }

        if (plant.getWateringIntervalDays() == null) {
            plant.setWateringIntervalDays(7);
        }

        return plantRepository.save(plant);
    }

    @PatchMapping("/{id}/water")
    public Plant waterPlant(@PathVariable Long id, Authentication auth) {
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plant not found"));

        if (!plant.getUserId().equals(getUserId(auth))) {
            throw new RuntimeException("Unauthorized");
        }

        plant.setLastWatered(LocalDate.now());
        return plantRepository.save(plant);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlant(@PathVariable Long id, Authentication auth) {
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plant not found"));

        if (!plant.getUserId().equals(getUserId(auth))) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }

        plantRepository.delete(plant);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(Authentication auth) {
        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getId();
    }
}