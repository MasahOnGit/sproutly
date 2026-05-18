package com.sproutly.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plant-identify")
public class PlantIdentifyController {

    private final RestClient restClient;

    @Value("${plantnet.api.key}")
    private String apiKey;

    public PlantIdentifyController(RestClient restClient) {
        this.restClient = restClient;
    }

    @PostMapping
    public ResponseEntity<?> identifyPlant(@RequestBody Map<String, String> request) {
        try {
            String image = request.get("image");

            if (image == null || image.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Image is required"));
            }

            String base64Image = image.contains(",")
                    ? image.substring(image.indexOf(",") + 1)
                    : image;

            byte[] imageBytes = Base64.getDecoder().decode(base64Image);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("organs", "leaf");
            body.add("images", new NamedByteArrayResource(imageBytes, "plant.jpg"));

            Map response;

            try {
                response = restClient.post()
                        .uri("https://my-api.plantnet.org/v2/identify/all?api-key={key}", apiKey)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .body(body)
                        .retrieve()
                        .body(Map.class);
            } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
                return ResponseEntity.ok(Map.of(
                        "commonName", "Plant not recognized",
                        "scientificName", "Unknown",
                        "confidence", 0,
                        "careTips", "Try taking a clearer photo of one leaf or flower in good lighting.",
                        "note", "Pl@ntNet could not identify this image."
                ));
            }

            List results = response == null ? null : (List) response.get("results");

            if (results == null || results.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "commonName", "Plant not recognized",
                        "scientificName", "Unknown",
                        "confidence", 0,
                        "careTips", "Try taking a clearer photo in good lighting."
                ));
            }

            Map first = (Map) results.get(0);
            Map species = (Map) first.get("species");

            String scientificName = String.valueOf(
                    species.getOrDefault("scientificNameWithoutAuthor", "Unknown")
            );

            List commonNames = (List) species.get("commonNames");

            String commonName = commonNames != null && !commonNames.isEmpty()
                    ? String.valueOf(commonNames.get(0))
                    : scientificName;

            double confidence = ((Number) first.getOrDefault("score", 0)).doubleValue();

            return ResponseEntity.ok(Map.of(
                    "commonName", commonName,
                    "scientificName", scientificName,
                    "confidence", confidence,
                    "careTips", "Place in bright indirect light and water when the top soil becomes dry."
            ));

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(500).body(Map.of(
                    "message", "Plant identification failed",
                    "error", e.getMessage()
            ));
        }
    }

    static class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;

        public NamedByteArrayResource(byte[] byteArray, String filename) {
            super(byteArray);
            this.filename = filename;
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }
}