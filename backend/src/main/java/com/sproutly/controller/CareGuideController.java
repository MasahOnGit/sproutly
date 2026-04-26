package com.sproutly.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/care-guide")
public class CareGuideController {

    @GetMapping
    public Map<String, Object> getCareGuide(@RequestParam String plant) {
        return Map.of(
            "query", plant,
            "sunlight", "Bright indirect light",
            "watering", "Every 7-10 days, when top soil is dry",
            "careLevel", "Beginner-friendly"
        );
    }
}