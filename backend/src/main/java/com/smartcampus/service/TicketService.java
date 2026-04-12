package com.smartcampus.service;

import com.smartcampus.dto.*;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.model.TicketAttachmentEntity;
import com.smartcampus.model.TicketCommentEntity;
import com.smartcampus.model.TicketEntity;
import com.smartcampus.model.UserEntity;
import com.smartcampus.repository.TicketAttachmentRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, Long userId, List<MultipartFile> files) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (files != null && files.size() > 3) {
            throw new IllegalArgumentException("Maximum of 3 files allowed per ticket");
        }

        TicketEntity ticket = TicketEntity.builder()
                .ticketCode("TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .location(request.getLocation())
                .resourceName(request.getResourceName())
                .preferredContact(request.getPreferredContact())
                .createdBy(user)
                .status(TicketStatus.OPEN)
                .build();

        ticket = ticketRepository.save(ticket);

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileName = fileStorageService.storeFile(file);
                    TicketAttachmentEntity attachment = TicketAttachmentEntity.builder()
                            .ticket(ticket)
                            .fileName(file.getOriginalFilename())
                            .filePath(fileName)
                            .contentType(file.getContentType())
                            .build();
                    ticketAttachmentRepository.save(attachment);
                }
            }
        }

        return mapToResponse(ticket);
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getMyTickets(Long userId) {
        return ticketRepository.findByCreatedByIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TicketResponse getTicketById(Long id) {
        TicketEntity ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return mapToResponse(ticket);
    }

    @Transactional
    public TicketResponse updateStatus(Long id, UpdateTicketStatusRequest request) {
        TicketEntity ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setStatus(request.getStatus());
        if (request.getStatus() == TicketStatus.REJECTED) {
            ticket.setRejectionReason(request.getRejectionReason());
        }
        
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse assignTechnician(Long id, AssignTechnicianRequest request) {
        TicketEntity ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        UserEntity tech = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        
        if (!"TECHNICIAN".equals(tech.getRole()) && !"ADMIN".equals(tech.getRole())) {
             throw new IllegalArgumentException("User is not a valid technician");
        }

        ticket.setAssignedTechnician(tech);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse resolveTicket(Long id, ResolveTicketRequest request) {
        TicketEntity ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setResolutionNotes(request.getResolutionNotes());
        ticket.setStatus(TicketStatus.RESOLVED);
        
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketCommentResponse addComment(Long ticketId, AddCommentRequest request, Long authorId) {
        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        UserEntity author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TicketCommentEntity comment = TicketCommentEntity.builder()
                .ticket(ticket)
                .author(author)
                .message(request.getMessage())
                .build();
        
        comment = ticketCommentRepository.save(comment);

        return TicketCommentResponse.builder()
                .id(comment.getId())
                .ticketId(ticket.getId())
                .authorName(author.getName())
                .authorId(author.getId())
                .message(comment.getMessage())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    @Transactional
    public TicketCommentResponse editComment(Long commentId, AddCommentRequest request, Long userId, String userRole) {
        TicketCommentEntity comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }
        
        comment.setMessage(request.getMessage());
        comment = ticketCommentRepository.save(comment);
        
        return TicketCommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicket().getId())
                .authorName(comment.getAuthor().getName())
                .authorId(comment.getAuthor().getId())
                .message(comment.getMessage())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId, String userRole) {
        TicketCommentEntity comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getAuthor().getId().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("You do not have permission to delete this comment");
        }
        
        ticketCommentRepository.delete(comment);
    }

    public List<TicketCommentResponse> getComments(Long ticketId) {
        return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(c -> TicketCommentResponse.builder()
                        .id(c.getId())
                        .ticketId(c.getTicket().getId())
                        .authorName(c.getAuthor().getName())
                        .authorId(c.getAuthor().getId())
                        .message(c.getMessage())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<TicketAttachmentResponse> getAttachments(Long ticketId) {
        return ticketAttachmentRepository.findByTicketId(ticketId).stream()
                .map(a -> {
                    String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                            .path("/uploads/")
                            .path(a.getFilePath())
                            .toUriString();
                    return TicketAttachmentResponse.builder()
                            .id(a.getId())
                            .ticketId(a.getTicket().getId())
                            .fileName(a.getFileName())
                            .url(fileDownloadUri)
                            .uploadedAt(a.getUploadedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private TicketResponse mapToResponse(TicketEntity ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .location(ticket.getLocation())
                .resourceName(ticket.getResourceName())
                .preferredContact(ticket.getPreferredContact())
                .rejectionReason(ticket.getRejectionReason())
                .resolutionNotes(ticket.getResolutionNotes())
                .createdBy(ticket.getCreatedBy() != null ? ticket.getCreatedBy().getName() : null)
                .createdById(ticket.getCreatedBy() != null ? ticket.getCreatedBy().getId() : null)
                .assignedTechnician(ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getName() : null)
                .assignedTechnicianId(ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getId() : null)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
