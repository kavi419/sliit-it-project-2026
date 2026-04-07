package com.smartcampus.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security configuration.
 *
 * Rules:
 *  - /api/bookings/**  → requires authentication (students must log in via Google)
 *  - All other requests → permitted (public endpoints, static assets, OAuth2 flow)
 *  - OAuth2 login is enabled with our custom OAuth2UserService
 *  - On successful login the user is redirected to /dashboard
 *  - CSRF is disabled for simplicity; re-enable in production if using sessions
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2UserService oAuth2UserService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ── Authorization rules ──────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                // Students must be authenticated to access bookings API
                .requestMatchers("/api/bookings/**").authenticated()
                // Everything else is publicly accessible
                .anyRequest().permitAll()
            )

            // ── OAuth2 Login (Google) ─────────────────────────────────────────
            .oauth2Login(oauth2 -> oauth2
                // Use our custom service to save/update the user in app_users
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oAuth2UserService)
                )
                // Redirect after a successful Google login
                .defaultSuccessUrl("/dashboard", true)
                // Redirect after logout
            )

            // ── Logout ────────────────────────────────────────────────────────
            .logout(logout -> logout
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
            )

            // ── CSRF ─────────────────────────────────────────────────────────
            // Disabled here for REST API convenience.
            // If you add a frontend session-based form, re-enable CSRF.
            .csrf(csrf -> csrf.disable());

        return http.build();
    }
}
