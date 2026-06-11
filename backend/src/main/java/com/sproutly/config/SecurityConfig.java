package com.sproutly.config;

import com.sproutly.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.client.RestClient;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

/**
 * Security configuration for the Sproutly backend.
 *
 * This class defines how authentication and authorization work in the application.
 * It configures password encryption, user lookup, permitted public endpoints,
 * protected routes, CORS settings, and disables default Spring Security login mechanisms.
 */
@Configuration
public class SecurityConfig {

    private final UserRepository userRepository;

    /**
     * Creates a new SecurityConfig with access to the user repository.
     *
     * @param userRepository repository used to find users by email during authentication
     */
    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Creates a reusable RestClient bean.
     *
     * This can be injected into other services/controllers to make HTTP requests
     * to external APIs, such as plant or weather APIs.
     *
     * @return configured RestClient instance
     */
    @Bean
    public RestClient restClient() {
        return RestClient.builder().build();
    }

    /**
     * Defines how Spring Security loads a user during login.
     *
     * The application uses the user's email as the username.
     * If the email exists in the database, the user is converted into a Spring Security
     * user object. If not, authentication fails.
     *
     * @return UserDetailsService used by Spring Security for authentication
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            // Search for the user in the database by email
            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // Convert the app's User entity into Spring Security's UserDetails format
            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .roles("USER")
                    .build();
        };
    }

    /**
     * Defines the password encoder used for hashing and checking passwords.
     *
     * BCrypt is used so raw passwords are never stored directly in the database.
     *
     * @return BCrypt password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures the authentication provider.
     *
     * The provider tells Spring Security how to load users and how to verify
     * their passwords during login.
     *
     * @return configured authentication provider
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();

        // Use the custom user lookup method defined above
        provider.setUserDetailsService(userDetailsService());

        // Use BCrypt to compare login passwords with stored hashed passwords
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    /**
     * Exposes the AuthenticationManager as a bean.
     *
     * This is usually used inside the authentication controller to manually
     * authenticate login requests.
     *
     * @param config Spring's authentication configuration
     * @return AuthenticationManager used to authenticate users
     * @throws Exception if the authentication manager cannot be created
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Defines the main Spring Security filter chain.
     *
     * This method controls CORS, CSRF, public endpoints, protected endpoints,
     * authentication provider setup, and disables Spring's default login methods.
     *
     * @param http HttpSecurity object used to configure security rules
     * @return configured SecurityFilterChain
     * @throws Exception if the security configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Allow frontend applications to make requests to this backend
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration configuration = new CorsConfiguration();

                    // Allowed frontend development URLs
                    configuration.setAllowedOrigins(List.of(
                            "http://127.0.0.1:5500",
                            "http://localhost:5500",
                            "http://localhost:3000"
                    ));

                    // HTTP methods the frontend is allowed to use
                    configuration.setAllowedMethods(List.of("GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"));

                    // Allow all request headers
                    configuration.setAllowedHeaders(List.of("*"));

                    // Allow cookies/session credentials in cross-origin requests
                    configuration.setAllowCredentials(true);

                    return configuration;
                }))

                // Disable CSRF protection because this backend is used as an API
                .csrf(csrf -> csrf.disable())

                // Define which endpoints are public and which require authentication
                .authorizeHttpRequests(auth -> auth

                        // Allow access to the H2 database console
                        .requestMatchers("/h2-console/**").permitAll()

                        // Allow users to register, log in, and log out without already being authenticated
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/logout"
                        ).permitAll()

                        // Allow plant identification without login
                        .requestMatchers(HttpMethod.POST, "/api/plant-identify").permitAll()

                        // Allow public access to weather and care guide data
                        .requestMatchers(HttpMethod.GET,
                                "/api/weather/**",
                                "/api/care-guide/**"
                        ).permitAll()

                        // Require authentication for every other endpoint
                        .anyRequest().authenticated()
                )

                // Use the custom authentication provider configured above
                .authenticationProvider(authenticationProvider())

                // Disable frame protection so the H2 console can load correctly in the browser
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))

                // Disable Spring Security's default login form
                .formLogin(form -> form.disable())

                // Disable browser basic authentication popup
                .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }
}