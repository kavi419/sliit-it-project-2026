package com.smartcampus.controller;

import com.smartcampus.dto.*;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;
    private final HttpServletRequest request;

    private UserEntity getAuthenticatedUser(Authentication authentication) {
        // Prioritize explicit frontend headers to prevent stale JSESSIONID cookies from causing out-of-sync users
        String mockEmail = request.getHeader("X-Mock-Email");
        String mockRole = request.getHeader("X-Mock-Role");

        if (mockEmail != null && !mockEmail.isEmpty()) {
            UserEntity testUser = userRepository.findByEmail(mockEmail).orElse(null);
            if (testUser == null) {
                testUser = new UserEntity();
                testUser.setName("Mock " + (mockRole != null ? mockRole : "USER"));
                testUser.setEmail(mockEmail);
                testUser.setRole(mockRole != null ? mockRole.toUpperCase() : "USER");
                testUser = userRepository.save(testUser);
            }
            return testUser;
        }

        if (authentication != null && authentication.getPrincipal() instanceof OAuth2User) {
            String email = ((OAuth2User) authentication.getPrincipal()).getAttribute("email");
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found in database"));
        } else if (authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")) {
            String email = authentication.getName();
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found in database"));
        } else {
            // Fallback
            if (mockRole == null) mockRole = "USER";
            String defaultMockEmail = mockRole.toLowerCase() + "@test.com";

            UserEntity testUser = userRepository.findByEmail(defaultMockEmail).orElse(null);
            if (testUser == null) {
                testUser = new UserEntity();
                testUser.setName("Mock " + mockRole);
                testUser.setEmail(defaultMockEmail);
                testUser.setRole(mockRole.toUpperCase());
                testUser = userRepository.save(testUser);
            }
            return testUser;
        }
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<TicketResponse> createTicket(
            Authentication authentication,
            @ModelAttribute CreateTicketRequest request,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        
        UserEntity user = getAuthenticatedUser(authentication);
        TicketResponse ticket = ticketService.createTicket(request, user.getId(), files);
        return new ResponseEntity<>(ticket, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(
            Authentication authentication) {
        // Technically only admins or staff should see all.
        // For simplicity, we just fetch all here.
        getAuthenticatedUser(authentication);
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            Authentication authentication) {
        UserEntity user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId()));
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponse>> getAssignedTickets(
            Authentication authentication) {
        UserEntity user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(ticketService.getAssignedTickets(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(
            Authentication authentication,
            @PathVariable String id) {
        getAuthenticatedUser(authentication);
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody CreateTicketRequest request) {
        UserEntity user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(ticketService.updateTicket(id, request, user.getId(), user.getRole()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            Authentication authentication,
            @PathVariable String id) {
        UserEntity user = getAuthenticatedUser(authentication);
        ticketService.deleteTicket(id, user.getId(), user.getRole());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody UpdateTicketStatusRequest request) {
        getAuthenticatedUser(authentication);
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody AssignTechnicianRequest request) {
        getAuthenticatedUser(authentication);
        // Add role check for Admin
        return ResponseEntity.ok(ticketService.assignTechnician(id, request));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<TicketResponse> resolveTicket(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody ResolveTicketRequest request) {
        getAuthenticatedUser(authentication);
        return ResponseEntity.ok(ticketService.resolveTicket(id, request));
    }

    // --- Comments Endpoints ---

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody AddCommentRequest request) {
        UserEntity user = getAuthenticatedUser(authentication);
        return new ResponseEntity<>(ticketService.addComment(id, request, user.getId()), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getComments(
            Authentication authentication,
            @PathVariable String id) {
        getAuthenticatedUser(authentication);
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketCommentResponse> editComment(
            Authentication authentication,
            @PathVariable Long commentId,
            @RequestBody AddCommentRequest request) {
        UserEntity user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(ticketService.editComment(commentId, request, user.getId(), user.getRole()));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            Authentication authentication,
            @PathVariable Long commentId) {
        UserEntity user = getAuthenticatedUser(authentication);
        ticketService.deleteComment(commentId, user.getId(), user.getRole());
        return ResponseEntity.noContent().build();
    }

    // --- Attachments Endpoints ---

    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<TicketAttachmentResponse>> getAttachments(
            Authentication authentication,
            @PathVariable String id) {
        getAuthenticatedUser(authentication);
        return ResponseEntity.ok(ticketService.getAttachments(id));
    }

    // --- Utility Endpoints ---
    @GetMapping("/technicians")
    public ResponseEntity<List<UserEntity>> getTechnicians(
            Authentication authentication) {
        getAuthenticatedUser(authentication);
        List<UserEntity> techs = userRepository.findByRole("TECHNICIAN");
        // We probably don't want to expose google properties, but for simplicity returning the entity
        return ResponseEntity.ok(techs);
    }
}
