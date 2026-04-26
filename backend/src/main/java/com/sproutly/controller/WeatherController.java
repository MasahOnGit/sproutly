package com.sproutly.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @GetMapping
    public Map<String, Object> getWeather(@RequestParam String city) {
        return Map.of(
            "city", city,
            "temperature", 18 + (int)(Math.random() * 10),
            "humidity", 60 + (int)(Math.random() * 20),
            "description", "Partly cloudy",
            "wateringAdvice", Math.random() > 0.5 ?
                "Good conditions for watering" : "Recent rain, consider skipping"
        );
    }
}