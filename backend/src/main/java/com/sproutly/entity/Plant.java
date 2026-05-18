package com.sproutly.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "plants")
public class Plant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String photoUrl;

    private String type;
    private String speciesSlug;
    private String location;
    private String notes;

    @Column(name = "watering_interval_days")
    private Integer wateringIntervalDays = 7;

    @Column(name = "last_watered")
    private LocalDate lastWatered;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    public Plant() {}

    public Plant(String name, String type, String speciesSlug, String photoUrl,
                 String location, String notes, Integer wateringIntervalDays,
                 LocalDate lastWatered, Long userId) {
        this.name = name;
        this.type = type;
        this.speciesSlug = speciesSlug;
        this.photoUrl = photoUrl;
        this.location = location;
        this.notes = notes;
        this.wateringIntervalDays = wateringIntervalDays;
        this.lastWatered = lastWatered;
        this.userId = userId;
    }

    // Getters/Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSpeciesSlug() { return speciesSlug; }
    public void setSpeciesSlug(String speciesSlug) { this.speciesSlug = speciesSlug; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Integer getWateringIntervalDays() { return wateringIntervalDays; }
    public void setWateringIntervalDays(Integer wateringIntervalDays) { this.wateringIntervalDays = wateringIntervalDays; }

    public LocalDate getLastWatered() { return lastWatered; }
    public void setLastWatered(LocalDate lastWatered) { this.lastWatered = lastWatered; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}