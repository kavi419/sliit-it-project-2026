package com.smartcampus.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

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
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2UserService oAuth2UserService;

    /**
     * Prints all OAuth2 user attributes to terminal immediately after successful login.
     * This confirms the login completed BEFORE our service ran into any DB issue.
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

            System.out.println("=== Redirecting to /dashboard ===");
            response.sendRedirect("/dashboard");
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ── Authorization rules ──────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/bookings/**").authenticated()
                .anyRequest().permitAll()
            )

            // ── OAuth2 Login (Google) ─────────────────────────────────────────
            .oauth2Login(oauth2 -> oauth2
                // Explicitly wire our custom service to save/update user in app_users
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oAuth2UserService)
                )
                // Print all user attributes on success, then redirect
                .successHandler(oAuth2SuccessHandler())
            )

            // ── Logout ────────────────────────────────────────────────────────
            .logout(logout -> logout
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
            )

            // ── CSRF ─────────────────────────────────────────────────────────
            .csrf(csrf -> csrf.disable());

        return http.build();
    }
}
