package com.springboot.smartcampus.controller;

import com.springboot.smartcampus.dto.ResourceRequest;
import com.springboot.smartcampus.dto.ResourceResponse;
import com.springboot.smartcampus.dto.ResourceStatusUpdateRequest;
import com.springboot.smartcampus.enums.ResourceStatus;
import com.springboot.smartcampus.model.User;
import com.springboot.smartcampus.repository.UserRepository;
import com.springboot.smartcampus.service.ResourceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class ResourceController {

    private final ResourceService resourceService;
    private final UserRepository userRepository;
    private final HttpServletRequest httpServletRequest;

    public ResourceController(ResourceService resourceService, UserRepository userRepository, HttpServletRequest httpServletRequest) {
        this.resourceService = resourceService;
        this.userRepository = userRepository;
        this.httpServletRequest = httpServletRequest;
    }

    @GetMapping
    public ResponseEntity<Page<ResourceResponse>> searchResources(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status,
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(resourceService.searchResources(query, type, minCapacity, maxCapacity, location, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResource(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResource(id));
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(
            @Valid @RequestBody ResourceRequest request) {
        ensureAdmin();
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequest request) {
        ensureAdmin();
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ResourceStatusUpdateRequest request) {
        ensureAdmin();
        return ResponseEntity.ok(resourceService.updateStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long id) {
        ensureAdmin();
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    private String getAuthEmail() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }

        if (auth.getPrincipal() instanceof org.springframework.security.oauth2.core.user.OAuth2User oauth2User) {
            return oauth2User.getAttribute("email");
        }

        return auth.getName();
    }

    private User ensureAdmin() {
        String email = getAuthEmail();
        
        if (email == null) {
            String mockRole = httpServletRequest.getHeader("X-Mock-Role");
            if (mockRole != null) {
                if ("ADMIN".equalsIgnoreCase(mockRole)) {
                    String mockEmail = "admin@test.com";
                    return userRepository.findByEmail(mockEmail)
                            .orElseGet(() -> {
                                User user = new User();
                                user.setName("Mock Admin");
                                user.setEmail(mockEmail);
                                user.setRole("ADMIN");
                                return userRepository.save(user);
                            });
                } else {
                    throw new RuntimeException("Admin access required");
                }
            }
            throw new RuntimeException("Authentication required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found in database: " + email));

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Admin access required");
        }
        return user;
    }
}
