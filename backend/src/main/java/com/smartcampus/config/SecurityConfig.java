package com.smartcampus.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security configuration.
 *
 * Rules:
 *  - /api/bookings/** → requires authentication (students must log in via Google)
 *  - All other requests → permitted (public endpoints, static assets, OAuth2 flow)
 *  - OAuth2 login explicitly uses our OAuth2UserService (saves user to app_users)
 *  - A SuccessHandler prints the user's attributes on every successful login
 */
@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2UserService oAuth2UserService;

    /**
     * BCrypt password encoder bean — used by AuthController for hashing
     * and verifying email/password credentials.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Global CORS policy — allows the React dev server (ports 5173 & 5174)
     * to send credentialed requests to the Spring Boot backend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174", "http://localhost:5175"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Prints all OAuth2 user attributes to terminal immediately after successful login,
     * then redirects the browser back to the React frontend dashboard.
     */
    @Bean
    public AuthenticationSuccessHandler oAuth2SuccessHandler() {
        return (request, response, authentication) -> {
            System.out.println("=== LOGIN SUCCESS ===");
            System.out.println("Principal: " + authentication.getName());
            System.out.println("Authorities: " + authentication.getAuthorities());

            // Print all Google attributes
            if (authentication.getPrincipal() instanceof
                    org.springframework.security.oauth2.core.user.OAuth2User oauthUser) {
                oauthUser.getAttributes().forEach((key, value) ->
                    System.out.println("  Attribute [" + key + "] = " + value)
                );
            }

            // ── Redirect to the React frontend dashboard, NOT the backend JSON endpoint ──
            System.out.println("=== Redirecting to React frontend dashboard ===");
            response.sendRedirect("http://localhost:5173/dashboard");
        };
    }

    /**
     * Shared SecurityContextRepository to ensure that manual authentication (AuthController)
     * and automatic session persistence (Spring Security filter chain) use the same storage.
     */
    @Bean
    public org.springframework.security.web.context.SecurityContextRepository securityContextRepository() {
        return new org.springframework.security.web.context.HttpSessionSecurityContextRepository();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ── CORS ─────────────────────────────────────────────────────────
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ── Authorization rules ──────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/user/me", "/", "/index.html", "/error").permitAll()
                .requestMatchers("/api/bookings/**", "/api/bookings").authenticated()
                .anyRequest().permitAll()
            )

            // ── OAuth2 Login (Google) ─────────────────────────────────────────
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService))
                .successHandler(oAuth2SuccessHandler())
            )

            // ── Logout ────────────────────────────────────────────────────────
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("http://localhost:5173/login")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
            )

            // ── CSRF ─────────────────────────────────────────────────────────
            .csrf(csrf -> csrf.disable())
            
            // ── Security Context Persistence ─────────────────────────────────
            .securityContext(context -> context
                .securityContextRepository(securityContextRepository())
            );

        return http.build();
    }
}
