package com.sproutly.repository;

import com.sproutly.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository used to manage User entities in the database.
 *
 * JpaRepository provides built-in database operations such as:
 * - save()
 * - findById()
 * - findAll()
 * - delete()
 *
 * This repository also includes a custom query method
 * for finding users by email address.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by email address.
     *
     * Spring Data JPA automatically generates the query
     * based on the method name.
     *
     * Example generated query:
     * SELECT * FROM users WHERE email = ?
     *
     * Optional is used because a user with the given
     * email may or may not exist.
     *
     * @param email user's email address
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
}