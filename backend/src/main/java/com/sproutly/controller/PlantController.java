package com.sproutly.controller;

import com.sproutly.entity.Plant;
import com.sproutly.repository.PlantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plants")
public class PlantController {

    @Autowired
    private PlantRepository plantRepository;

    @GetMapping
    public List<Plant> getPlants(Authentication auth) {
        Long userId = getUserId(auth);
        return plantRepository.findByUserId(userId);
    }

    @PostMapping
    public Plant createPlant(@RequestBody Plant plant, Authentication auth) {
        plant.setUserId(getUserId(auth));
        plant.setLastWatered(LocalDate.now());
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
    public void deletePlant(@PathVariable Long id, Authentication auth) {
        Plant plant = plantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Plant not found"));
        if (!plant.getUserId().equals(getUserId(auth))) {
            throw new RuntimeException("Unauthorized");
        }
        plantRepository.delete(plant);
    }

    private Long getUserId(Authentication auth) {
        // In real app, extract userId from JWT/session
        return 1L; // Simplified for demo
    }
}