package com.sproutly.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/care-guide")
public class CareGuideController {

    private final RestClient restClient;

    @Value("${perenual.api.key}")
    private String perenualApiKey;

    public CareGuideController(RestClient restClient) {
        this.restClient = restClient;
    }

    @GetMapping
    public Map<String, Object> getCareGuide(@RequestParam String plant) {

        // 1. Search Perenual for common name, scientific name, and image
        Map perenualResponse = restClient.get()
                .uri(
                        "https://perenual.com/api/v2/species-list?key={key}&q={plant}",
                        perenualApiKey,
                        plant
                )
                .retrieve()
                .body(Map.class);

        List perenualResults = perenualResponse == null
                ? null
                : (List) perenualResponse.get("data");

        if (perenualResults == null || perenualResults.isEmpty()) {
            return Map.of(
                    "query", plant,
                    "error", "Plant not found in Perenual",
                    "source", "Perenual + GBIF"
            );
        }

        Map firstPlant = (Map) perenualResults.get(0);

        String commonName = safeValue(firstPlant.get("common_name"));
        String scientificName = getScientificName(firstPlant.get("scientific_name"));
        String imageUrl = getImageUrl(firstPlant.get("default_image"));

        // 2. Search GBIF for family using the scientific name
        String family = getFamilyFromGbif(scientificName);

        // 3. Return combined data to frontend as JSON
        return Map.of(
                "query", plant,
                "commonName", commonName,
                "scientificName", scientificName,
                "family", family,
                "image", imageUrl,
                "source", "Perenual + GBIF"
        );
    }

    private String getFamilyFromGbif(String scientificName) {
        Map gbifResponse = restClient.get()
                .uri(
                        "https://api.gbif.org/v1/species/search?q={name}&rank=SPECIES&limit=1",
                        scientificName
                )
                .retrieve()
                .body(Map.class);

        List results = gbifResponse == null
                ? null
                : (List) gbifResponse.get("results");

        if (results == null || results.isEmpty()) {
            return "Unknown family";
        }

        Map first = (Map) results.get(0);

        return safeValue(first.get("family"));
    }

    private String getScientificName(Object value) {
        if (value instanceof List list && !list.isEmpty()) {
            return String.valueOf(list.get(0));
        }

        return value == null ? "Unknown" : String.valueOf(value);
    }

    private String getImageUrl(Object defaultImage) {
        if (!(defaultImage instanceof Map imageMap)) {
            return "No image available";
        }

        Object regularUrl = imageMap.get("regular_url");

        if (regularUrl != null) {
            return String.valueOf(regularUrl);
        }

        Object originalUrl = imageMap.get("original_url");

        if (originalUrl != null) {
            return String.valueOf(originalUrl);
        }

        return "No image available";
    }

    private String safeValue(Object value) {
        return value == null ? "Unknown" : String.valueOf(value);
    }
}