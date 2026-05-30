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

/**
 * Controller responsible for identifying plants from uploaded images.
 *
 * This controller:
 * - Receives a base64 image from the frontend
 * - Converts the image into bytes
 * - Sends the image to the Pl@ntNet API
 * - Returns the best matching plant result
 */
@RestController
@RequestMapping("/api/plant-identify")
public class PlantIdentifyController {

    /**
     * HTTP client used to send requests to the Pl@ntNet API.
     */
    private final RestClient restClient;

    /**
     * API key used to authenticate requests to the Pl@ntNet API.
     *
     * The value is loaded from application.properties using:
     * plantnet.api.key=your_api_key
     */
    @Value("${plantnet.api.key}")
    private String apiKey;

    /**
     * Creates a new PlantIdentifyController.
     *
     * @param restClient reusable HTTP client bean
     */
    public PlantIdentifyController(RestClient restClient) {
        this.restClient = restClient;
    }

    /**
     * Identifies a plant from an uploaded image.
     *
     * The frontend sends the image as a base64 string inside the request body.
     * This method removes any data URL prefix, decodes the image, sends it to
     * Pl@ntNet, then returns the most likely plant match.
     *
     * @param request request body containing the image as a base64 string
     * @return identified plant information or an error response
     */
    @PostMapping
    public ResponseEntity<?> identifyPlant(@RequestBody Map<String, String> request) {
        try {
            // Get the base64 image string from the request body
            String image = request.get("image");

            // Reject the request if no image was provided
            if (image == null || image.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Image is required"));
            }

            // Remove the data URL prefix if the frontend sends one
            // Example: data:image/jpeg;base64,/9j/4AAQSk...
            String base64Image = image.contains(",")
                    ? image.substring(image.indexOf(",") + 1)
                    : image;

            // Decode the base64 string into raw image bytes
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);

            // Create a multipart request body for the Pl@ntNet API
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            // Tell Pl@ntNet that the image shows a leaf
            body.add("organs", "leaf");

            // Add the uploaded image file to the multipart request
            body.add("images", new NamedByteArrayResource(imageBytes, "plant.jpg"));

            Map response;

            try {
                // Send the image to the Pl@ntNet identification endpoint
                response = restClient.post()
                        .uri("https://my-api.plantnet.org/v2/identify/all?api-key={key}", apiKey)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .body(body)
                        .retrieve()
                        .body(Map.class);

            } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {

                // If Pl@ntNet returns 404, treat it as "not recognized"
                return ResponseEntity.ok(Map.of(
                        "commonName", "Plant not recognized",
                        "scientificName", "Unknown",
                        "confidence", 0,
                        "careTips", "Try taking a clearer photo of one leaf or flower in good lighting.",
                        "note", "Pl@ntNet could not identify this image."
                ));
            }

            // Extract the results list from the Pl@ntNet response
            List results = response == null ? null : (List) response.get("results");

            // If no results were found, return a friendly fallback response
            if (results == null || results.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "commonName", "Plant not recognized",
                        "scientificName", "Unknown",
                        "confidence", 0,
                        "careTips", "Try taking a clearer photo in good lighting."
                ));
            }

            // Get the highest-scoring result
            Map first = (Map) results.get(0);

            // Extract species information from the result
            Map species = (Map) first.get("species");

            // Get the scientific name without the author name
            String scientificName = String.valueOf(
                    species.getOrDefault("scientificNameWithoutAuthor", "Unknown")
            );

            // Get the common names list, if available
            List commonNames = (List) species.get("commonNames");

            // Use the first common name if one exists, otherwise use the scientific name
            String commonName = commonNames != null && !commonNames.isEmpty()
                    ? String.valueOf(commonNames.get(0))
                    : scientificName;

            // Extract the confidence score returned by Pl@ntNet
            double confidence = ((Number) first.getOrDefault("score", 0)).doubleValue();

            // Return the identified plant data to the frontend
            return ResponseEntity.ok(Map.of(
                    "commonName", commonName,
                    "scientificName", scientificName,
                    "confidence", confidence,
                    "careTips", "Place in bright indirect light and water when the top soil becomes dry."
            ));

        } catch (Exception e) {
            // Print the error in the backend console for debugging
            e.printStackTrace();

            // Return a server error response to the frontend
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Plant identification failed",
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Custom ByteArrayResource that provides a filename.
     *
     * Multipart file uploads usually need a filename, but ByteArrayResource
     * does not provide one by default. This class adds one so the image can
     * be sent correctly to the Pl@ntNet API.
     */
    static class NamedByteArrayResource extends ByteArrayResource {

        /**
         * Filename sent with the multipart image upload.
         */
        private final String filename;

        /**
         * Creates a new resource from image bytes and a filename.
         *
         * @param byteArray raw image data
         * @param filename filename to send with the upload
         */
        public NamedByteArrayResource(byte[] byteArray, String filename) {
            super(byteArray);
            this.filename = filename;
        }

        /**
         * Returns the filename for the multipart upload.
         *
         * @return image filename
         */
        @Override
        public String getFilename() {
            return filename;
        }
    }
}