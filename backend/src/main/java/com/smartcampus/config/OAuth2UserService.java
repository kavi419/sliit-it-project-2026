package com.smartcampus.config;

import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * Custom OAuth2 user service that intercepts the Google login flow.
 * After Google authenticates the user, this service:
 *  1. Extracts the Google 'sub' (unique Google ID) and 'email' from the token.
 *  2. Looks up or creates/updates the corresponding row in app_users.
 *  3. Returns the OAuth2User so Spring Security can complete the login.
 */
@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Fetch user info from Google's userinfo endpoint
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String googleId = oAuth2User.getAttribute("sub");   // Stable Google user ID
        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");

        // Try to find existing user by googleId first, then fall back to email
        UserEntity user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .map(existingUser -> {
                    // Update google_id if linking for the first time via email
                    if (existingUser.getGoogleId() == null) {
                        existingUser.setGoogleId(googleId);
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    // First-time Google login — provision a new account
                    String username = deriveUsername(email, name);
                    return UserEntity.builder()
                            .googleId(googleId)
                            .email(email)
                            .username(username)
                            .role("STUDENT")   // Default role for new Google sign-ins
                            .build();
                });

        userRepository.save(user);
        return oAuth2User;
    }

    /**
     * Derives a username from the email local part or display name.
     * Falls back to the raw email if both are blank.
     */
    private String deriveUsername(String email, String name) {
        if (name != null && !name.isBlank()) {
            return name.trim().toLowerCase().replaceAll("\\s+", "_");
        }
        if (email != null && email.contains("@")) {
            return email.substring(0, email.indexOf('@'));
        }
        return email;
    }
}
