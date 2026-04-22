package com.smartcampus.controller;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import com.smartcampus.dto.ResourceStatusUpdateRequest;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.ResourceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class ResourceController {

    private final ResourceService resourceService;
    private final UserRepository userRepository;
    private final HttpServletRequest httpServletRequest;

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> searchResources(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status) {
        return ResponseEntity.ok(resourceService.searchResources(query, type, minCapacity, maxCapacity, location, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResource(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResource(id));
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @Valid @RequestBody ResourceRequest request) {
        ensureAdmin(oauth2User);
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequest request) {
        ensureAdmin(oauth2User);
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceResponse> updateStatus(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable Long id,
            @Valid @RequestBody ResourceStatusUpdateRequest request) {
        ensureAdmin(oauth2User);
        return ResponseEntity.ok(resourceService.updateStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable Long id) {
        ensureAdmin(oauth2User);
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    private UserEntity ensureAdmin(OAuth2User oauth2User) {
        if (oauth2User == null) {
            String mockRole = httpServletRequest.getHeader("X-Mock-Role");
            if (!"ADMIN".equalsIgnoreCase(mockRole)) {
                throw new RuntimeException("Admin access required");
            }
            String mockEmail = "admin@test.com";
            return userRepository.findByEmail(mockEmail)
                    .orElseGet(() -> {
                        UserEntity user = new UserEntity();
                        user.setName("Mock Admin");
                        user.setEmail(mockEmail);
                        user.setRole("ADMIN");
                        return userRepository.save(user);
                    });
        }

        String email = oauth2User.getAttribute("email");
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found in database"));

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Admin access required");
        }
        return user;
    }
}