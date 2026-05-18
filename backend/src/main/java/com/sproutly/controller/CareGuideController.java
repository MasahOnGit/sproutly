package com.sproutly.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/care-guide")
public class CareGuideController {

    private final RestClient restClient;

    public CareGuideController(RestClient restClient) {
        this.restClient = restClient;
    }

    @GetMapping
    public Map<String, Object> getCareGuide(@RequestParam String plant) {
        Map gbif = restClient.get()
                .uri("https://api.gbif.org/v1/species/search?q={plant}&rank=SPECIES&limit=1", plant)
                .retrieve()
                .body(Map.class);

        List results = gbif == null ? null : (List) gbif.get("results");

        String scientificName = plant;
        String family = "Unknown family";

        if (results != null && !results.isEmpty()) {
            Map first = (Map) results.get(0);
            scientificName = String.valueOf(first.getOrDefault("scientificName", plant));
            family = String.valueOf(first.getOrDefault("family", "Unknown family"));
        }

        return Map.of(
                "query", plant,
                "scientificName", scientificName,
                "family", family,
                "sunlight", "Bright indirect light is safest for most indoor plants.",
                "watering", "Water when the top 2-3 cm of soil feels dry.",
                "careLevel", "Beginner-friendly",
                "source", "GBIF species lookup plus general houseplant guidance"
        );
    }
}