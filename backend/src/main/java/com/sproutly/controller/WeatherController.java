package com.sproutly.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final RestClient restClient;

    public WeatherController(RestClient restClient) {
        this.restClient = restClient;
    }

    @GetMapping
    public Map<String, Object> getWeather(@RequestParam String city) {
        Map geo = restClient.get()
                .uri("https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json", city)
                .retrieve()
                .body(Map.class);

        List results = geo == null ? null : (List) geo.get("results");

        if (results == null || results.isEmpty()) {
            return Map.of(
                    "city", city,
                    "temperature", "--",
                    "humidity", "--",
                    "description", "City not found",
                    "wateringAdvice", "Could not check weather."
            );
        }

        Map first = (Map) results.get(0);
        Double latitude = ((Number) first.get("latitude")).doubleValue();
        Double longitude = ((Number) first.get("longitude")).doubleValue();
        String resolvedCity = String.valueOf(first.get("name"));

        Map weather = restClient.get()
                .uri("https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code",
                        latitude, longitude)
                .retrieve()
                .body(Map.class);

        Map current = (Map) weather.get("current");

        double temperature = ((Number) current.get("temperature_2m")).doubleValue();
        int humidity = ((Number) current.get("relative_humidity_2m")).intValue();
        double precipitation = ((Number) current.get("precipitation")).doubleValue();

        String advice;
        if (precipitation > 0) {
            advice = "Rain detected. Check soil before watering.";
        } else if (temperature >= 27) {
            advice = "Warm weather. Plants may dry faster, so check soil moisture.";
        } else if (humidity >= 75) {
            advice = "High humidity. Water less often unless soil is dry.";
        } else {
            advice = "Normal conditions. Follow your regular watering schedule.";
        }

        return Map.of(
                "city", resolvedCity,
                "temperature", temperature,
                "humidity", humidity,
                "description", "Current weather from Open-Meteo",
                "wateringAdvice", advice
        );
    }
}