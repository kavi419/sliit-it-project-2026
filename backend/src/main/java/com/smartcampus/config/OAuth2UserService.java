package com.smartcampus.config;

import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

/**
 * Custom OAuth2 user service — saves/updates users in app_users on every Google login.
 */
@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        // Step 1: Fetch user attributes from Google
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String googleId = oAuth2User.getAttribute("sub");
        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");

        System.out.println("=== Google OAuth2 Login ===");
        System.out.println("Google ID : " + googleId);
        System.out.println("Email     : " + email);
        System.out.println("Name      : " + name);

        boolean isAdmin = email != null && email.startsWith("kavindunethmina");
        String targetRole = isAdmin ? "ADMIN" : "STUDENT";

        // Step 2: Check if user already exists
        var existingOpt = userRepository.findByEmail(email);

        if (existingOpt.isPresent()) {
            UserEntity existingUser = existingOpt.get();
            boolean needsUpdate = false;

            if (existingUser.getGoogleId() == null) {
                existingUser.setGoogleId(googleId);
                needsUpdate = true;
                System.out.println("Linked Google ID to existing user: " + email);
            }

            if (isAdmin && !"ADMIN".equals(existingUser.getRole())) {
                existingUser.setRole("ADMIN");
                needsUpdate = true;
                System.out.println("Upgraded existing user to ADMIN role: " + email);
            }

            if (needsUpdate) {
                System.out.println("DEBUG: DB Update attempted for: " + email);
                try {
                    userRepository.save(existingUser);
                    userRepository.flush();
                    System.out.println("User updated successfully");
                } catch (Exception e) {
                    System.out.println("ERROR updating user: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("Existing user logged in: " + email);
            }
            return buildOAuth2User(oAuth2User, existingUser.getRole());
        }

        // Step 3: New user — build from Google attributes only
        UserEntity newUser = UserEntity.builder()
                .googleId(googleId)
                .email(email)
                .name(name != null ? name : "Unknown")
                .fullName(name)
                .role(targetRole)
                .build();

        System.out.println("DEBUG: DB Save attempted for: " + email);
        try {
            userRepository.save(newUser);
            userRepository.flush();
            System.out.println("User saved successfully");
            System.out.println("User saved: " + email);
        } catch (Exception e) {
            System.out.println("ERROR saving user: " + e.getMessage());
            e.printStackTrace();
        }

        return buildOAuth2User(oAuth2User, targetRole);
    }

    private OAuth2User buildOAuth2User(OAuth2User baseUser, String role) {
        Set<GrantedAuthority> authorities = new HashSet<>(baseUser.getAuthorities());
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
        
        return new DefaultOAuth2User(
            authorities, 
            baseUser.getAttributes(), 
            "sub"
        );
    }
}
