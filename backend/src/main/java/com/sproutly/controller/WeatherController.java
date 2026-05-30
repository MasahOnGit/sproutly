package com.sproutly.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Controller responsible for retrieving weather data and generating watering advice.
 *
 * This controller:
 * - Receives a city name from the frontend
 * - Uses Open-Meteo geocoding to find the city's latitude and longitude
 * - Uses Open-Meteo weather data to get current conditions
 * - Returns temperature, humidity, and watering advice
 */
@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    /**
     * HTTP client used to call the Open-Meteo APIs.
     */
    private final RestClient restClient;

    /**
     * Creates a new WeatherController.
     *
     * @param restClient reusable HTTP client bean
     */
    public WeatherController(RestClient restClient) {
        this.restClient = restClient;
    }

    /**
     * Gets the current weather for a city and returns plant watering advice.
     *
     * The method first converts the city name into coordinates using the
     * Open-Meteo geocoding API. It then uses those coordinates to request
     * current weather data.
     *
     * @param city city name provided by the user
     * @return map containing weather information and watering advice
     */
    @GetMapping
    public Map<String, Object> getWeather(@RequestParam String city) {

        // Search for the city and retrieve its latitude and longitude
        Map geo = restClient.get()
                .uri(
                        "https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json",
                        city
                )
                .retrieve()
                .body(Map.class);

        // Extract search results from the geocoding response
        List results = geo == null ? null : (List) geo.get("results");

        // If no city was found, return a fallback response
        if (results == null || results.isEmpty()) {
            return Map.of(
                    "city", city,
                    "temperature", "--",
                    "humidity", "--",
                    "description", "City not found",
                    "wateringAdvice", "Could not check weather."
            );
        }

        // Use the first matching city result
        Map first = (Map) results.get(0);

        // Extract the city's coordinates
        Double latitude = ((Number) first.get("latitude")).doubleValue();
        Double longitude = ((Number) first.get("longitude")).doubleValue();

        // Use the resolved city name returned by the API
        String resolvedCity = String.valueOf(first.get("name"));

        // Request current weather data for the coordinates
        Map weather = restClient.get()
                .uri(
                        "https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code",
                        latitude,
                        longitude
                )
                .retrieve()
                .body(Map.class);

        // Extract the current weather object
        Map current = (Map) weather.get("current");

        // Extract temperature, humidity, and precipitation values
        double temperature = ((Number) current.get("temperature_2m")).doubleValue();
        int humidity = ((Number) current.get("relative_humidity_2m")).intValue();
        double precipitation = ((Number) current.get("precipitation")).doubleValue();

        String advice;

        // Give advice based on rain, temperature, and humidity
        if (precipitation > 0) {
            advice = "Rain detected. Check soil before watering.";
        } else if (temperature >= 27) {
            advice = "Warm weather. Plants may dry faster, so check soil moisture.";
        } else if (humidity >= 75) {
            advice = "High humidity. Water less often unless soil is dry.";
        } else {
            advice = "Normal conditions. Follow your regular watering schedule.";
        }

        // Return weather data and watering advice to the frontend
        return Map.of(
                "city", resolvedCity,
                "temperature", temperature,
                "humidity", humidity,
                "description", "Current weather from Open-Meteo",
                "wateringAdvice", advice
        );
    }
}