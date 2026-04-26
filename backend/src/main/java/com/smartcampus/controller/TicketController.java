package com.smartcampus.controller;

import com.smartcampus.dto.*;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    private UserEntity getAuthenticatedUser(OAuth2User oauth2User) {
        if (oauth2User == null) {
            // Fallback for local testing without Google OAuth
            String mockRole = request.getHeader("X-Mock-Role");
            if (mockRole == null) mockRole = "USER";
            
            String mockEmail = mockRole.toLowerCase() + "@test.com";

            UserEntity testUser = userRepository.findByEmail(mockEmail).orElse(null);
            if (testUser == null) {
                testUser = new UserEntity();
                testUser.setName("Mock " + mockRole);
                testUser.setEmail(mockEmail);
                testUser.setRole(mockRole.toUpperCase());
                testUser = userRepository.save(testUser);
            }
            return testUser;
        }
        String email = oauth2User.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found in database"));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<TicketResponse> createTicket(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @ModelAttribute CreateTicketRequest request,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        
        UserEntity user = getAuthenticatedUser(oauth2User);
        TicketResponse ticket = ticketService.createTicket(request, user.getId(), files);
        return new ResponseEntity<>(ticket, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(
            @AuthenticationPrincipal OAuth2User oauth2User) {
        // Technically only admins or staff should see all.
        // For simplicity, we just fetch all here.
        getAuthenticatedUser(oauth2User);
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @AuthenticationPrincipal OAuth2User oauth2User) {
        UserEntity user = getAuthenticatedUser(oauth2User);
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId()));
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponse>> getAssignedTickets(
            @AuthenticationPrincipal OAuth2User oauth2User) {
        UserEntity user = getAuthenticatedUser(oauth2User);
        return ResponseEntity.ok(ticketService.getAssignedTickets(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String id) {
        getAuthenticatedUser(oauth2User);
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String id,
            @RequestBody CreateTicketRequest request) {
        UserEntity user = getAuthenticatedUser(oauth2User);
        return ResponseEntity.ok(ticketService.updateTicket(id, request, user.getId(), user.getRole()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String id) {
        UserEntity user = getAuthenticatedUser(oauth2User);
        ticketService.deleteTicket(id, user.getId(), user.getRole());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String id,
            @RequestBody UpdateTicketStatusRequest request) {
        getAuthenticatedUser(oauth2User);
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String id,
            @RequestBody AssignTechnicianRequest request) {
        getAuthenticatedUser(oauth2User);
        // Add role check for Admin
        return ResponseEntity.ok(ticketService.assignTechnician(id, request));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<TicketResponse> resolveTicket(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String id,
            @RequestBody ResolveTicketRequest request) {
        getAuthenticatedUser(oauth2User);
        return ResponseEntity.ok(ticketService.resolveTicket(id, request));
    }

    // --- Comments Endpoints ---

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String id,
            @RequestBody AddCommentRequest request) {
        UserEntity user = getAuthenticatedUser(oauth2User);
        return new ResponseEntity<>(ticketService.addComment(id, request, user.getId()), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getComments(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String id) {
        getAuthenticatedUser(oauth2User);
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketCommentResponse> editComment(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable Long commentId,
            @RequestBody AddCommentRequest request) {
        UserEntity user = getAuthenticatedUser(oauth2User);
        return ResponseEntity.ok(ticketService.editComment(commentId, request, user.getId(), user.getRole()));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable Long commentId) {
        UserEntity user = getAuthenticatedUser(oauth2User);
        ticketService.deleteComment(commentId, user.getId(), user.getRole());
        return ResponseEntity.noContent().build();
    }

    // --- Attachments Endpoints ---

    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<TicketAttachmentResponse>> getAttachments(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String id) {
        getAuthenticatedUser(oauth2User);
        return ResponseEntity.ok(ticketService.getAttachments(id));
    }

    // --- Utility Endpoints ---
    @GetMapping("/technicians")
    public ResponseEntity<List<UserEntity>> getTechnicians(
            @AuthenticationPrincipal OAuth2User oauth2User) {
        getAuthenticatedUser(oauth2User);
        List<UserEntity> techs = userRepository.findByRole("TECHNICIAN");
        // We probably don't want to expose google properties, but for simplicity returning the entity
        return ResponseEntity.ok(techs);
    }
}
