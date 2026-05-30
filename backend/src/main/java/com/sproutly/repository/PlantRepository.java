package com.sproutly.repository;

import com.sproutly.entity.Plant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository used to manage Plant entities in the database.
 *
 * JpaRepository provides built-in database operations such as:
 * - save()
 * - findById()
 * - findAll()
 * - delete()
 *
 * This repository also includes a custom query method
 * for retrieving plants belonging to a specific user.
 */
public interface PlantRepository extends JpaRepository<Plant, Long> {

    /**
     * Finds all plants owned by a specific user.
     *
     * Spring Data JPA automatically generates the query
     * based on the method name.
     *
     * Example generated query:
     * SELECT * FROM plants WHERE user_id = ?
     *
     * @param userId ID of the user
     * @return list of plants belonging to the user
     */
    List<Plant> findByUserId(Long userId);
}