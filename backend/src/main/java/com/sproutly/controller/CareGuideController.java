package com.sproutly.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Controller responsible for providing plant care information.
 *
 * This controller:
 * - Receives a plant name from the frontend
 * - Uses the GBIF API to search for scientific plant data
 * - Returns basic plant care guidance
 */
@RestController
@RequestMapping("/api/care-guide")
public class CareGuideController {

    /**
     * HTTP client used to communicate with external APIs.
     */
    private final RestClient restClient;

    /**
     * Creates a new CareGuideController.
     *
     * @param restClient reusable HTTP client bean
     */
    public CareGuideController(RestClient restClient) {
        this.restClient = restClient;
    }

    /**
     * Retrieves a basic care guide for a plant.
     *
     * <p>This endpoint:
     * <ul>
     *     <li>Sends a request to the GBIF species API</li>
     *     <li>Attempts to find scientific classification data</li>
     *     <li>Returns general plant care recommendations</li>
     * </ul>
     * </p>
     *
     * Example request:
     * <pre>
     * GET /api/care-guide?plant=basil
     * </pre>
     *
     * @param plant common or scientific plant name provided by the user
     * @return map containing plant information and care instructions
     */
    @GetMapping
    public Map<String, Object> getCareGuide(@RequestParam String plant) {

        // Send request to the GBIF API to search for the plant species
        Map gbif = restClient.get()
                .uri(
                        "https://api.gbif.org/v1/species/search?q={plant}&rank=SPECIES&limit=1",
                        plant
                )
                .retrieve()
                .body(Map.class);

        // Extract the "results" array from the API response
        List results = gbif == null ? null : (List) gbif.get("results");

        // Default values in case the API does not find a match
        String scientificName = plant;
        String family = "Unknown family";

        // If results exist, extract scientific name and family
        if (results != null && !results.isEmpty()) {

            // Get the first matching species result
            Map first = (Map) results.get(0);

            // Extract scientific name from the response
            scientificName = String.valueOf(
                    first.getOrDefault("scientificName", plant)
            );

            // Extract plant family from the response
            family = String.valueOf(
                    first.getOrDefault("family", "Unknown family")
            );
        }

        // Return plant information and general care recommendations
        return Map.of(
                "query", plant,
                "scientificName", scientificName,
                "family", family,

                // General indoor plant care advice
                "sunlight", "Bright indirect light is safest for most indoor plants.",
                "watering", "Water when the top 2-3 cm of soil feels dry.",
                "careLevel", "Beginner-friendly",

                // Source description
                "source", "GBIF species lookup plus general houseplant guidance"
        );
    }
}