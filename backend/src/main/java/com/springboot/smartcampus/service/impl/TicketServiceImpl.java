package com.springboot.smartcampus.service.impl;

import com.springboot.smartcampus.dto.*;
import com.springboot.smartcampus.enums.TicketStatus;
import com.springboot.smartcampus.model.TicketAttachment;
import com.springboot.smartcampus.model.TicketComment;
import com.springboot.smartcampus.model.Ticket;
import com.springboot.smartcampus.model.User;
import com.springboot.smartcampus.repository.TicketAttachmentRepository;
import com.springboot.smartcampus.repository.TicketCommentRepository;
import com.springboot.smartcampus.repository.TicketRepository;
import com.springboot.smartcampus.repository.UserRepository;
import com.springboot.smartcampus.service.TicketService;
import com.springboot.smartcampus.service.FileStorageService;
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
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, Long userId, List<MultipartFile> files) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (files != null && files.size() > 3) {
            throw new IllegalArgumentException("Maximum of 3 files allowed per ticket");
        }

        Ticket ticket = Ticket.builder()
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
                    TicketAttachment attachment = TicketAttachment.builder()
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

    @Override
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getMyTickets(Long userId) {
        return ticketRepository.findByCreatedByIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getAssignedTickets(Long techId) {
        return ticketRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc(techId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Ticket findTicketByIdentifier(String identifier) {
        if (identifier != null && identifier.toUpperCase().startsWith("TCK-")) {
            return ticketRepository.findByTicketCode(identifier.toUpperCase())
                    .orElseThrow(() -> new RuntimeException("Ticket not found"));
        }
        try {
            Long numericId = Long.parseLong(identifier);
            return ticketRepository.findById(numericId)
                    .orElseThrow(() -> new RuntimeException("Ticket not found"));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid ticket identifier format");
        }
    }

    @Override
    public TicketResponse getTicketById(String id) {
        Ticket ticket = findTicketByIdentifier(id);
        return mapToResponse(ticket);
    }

    @Override
    @Transactional
    public TicketResponse updateStatus(String id, UpdateTicketStatusRequest request) {
        Ticket ticket = findTicketByIdentifier(id);
        
        ticket.setStatus(request.getStatus());
        if (request.getStatus() == TicketStatus.REJECTED) {
            ticket.setRejectionReason(request.getRejectionReason());
        }
        
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponse assignTechnician(String id, AssignTechnicianRequest request) {
        Ticket ticket = findTicketByIdentifier(id);
        
        User tech = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        
        if (!"TECHNICIAN".equals(tech.getRole()) && !"ADMIN".equals(tech.getRole())) {
             throw new IllegalArgumentException("User is not a valid technician");
        }

        ticket.setAssignedTechnician(tech);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponse resolveTicket(String id, ResolveTicketRequest request) {
        Ticket ticket = findTicketByIdentifier(id);
        
        ticket.setResolutionNotes(request.getResolutionNotes());
        ticket.setStatus(TicketStatus.RESOLVED);
        
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketCommentResponse addComment(String ticketId, AddCommentRequest request, Long authorId) {
        Ticket ticket = findTicketByIdentifier(ticketId);
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TicketComment comment = TicketComment.builder()
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

    @Override
    @Transactional
    public TicketCommentResponse editComment(Long commentId, AddCommentRequest request, Long userId, String userRole) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
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

    @Override
    @Transactional
    public void deleteComment(Long commentId, Long userId, String userRole) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getAuthor().getId().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("You do not have permission to delete this comment");
        }
        
        ticketCommentRepository.delete(comment);
    }

    @Override
    public List<TicketCommentResponse> getComments(String ticketId) {
        Ticket ticket = findTicketByIdentifier(ticketId);
        return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId()).stream()
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

    @Override
    public List<TicketAttachmentResponse> getAttachments(String ticketId) {
        Ticket ticket = findTicketByIdentifier(ticketId);
        return ticketAttachmentRepository.findByTicketId(ticket.getId()).stream()
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

    private TicketResponse mapToResponse(Ticket ticket) {
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

    @Override
@Transactional
public TicketResponse updateTicket(String id, CreateTicketRequest request, Long userId, String userRole) {
    Ticket ticket = findTicketByIdentifier(id);

    if (!ticket.getCreatedBy().getId().equals(userId) && !"ADMIN".equals(userRole)) {
        throw new RuntimeException("You do not have permission to update this ticket");
    }

    ticket.setTitle(request.getTitle());
    ticket.setDescription(request.getDescription());
    ticket.setCategory(request.getCategory());
    ticket.setPriority(request.getPriority());
    ticket.setLocation(request.getLocation());
    ticket.setResourceName(request.getResourceName());
    ticket.setPreferredContact(request.getPreferredContact());

    return mapToResponse(ticketRepository.save(ticket));
}

@Override
@Transactional
public void deleteTicket(String id, Long userId, String userRole) {
    Ticket ticket = findTicketByIdentifier(id);

    if (!ticket.getCreatedBy().getId().equals(userId) && !"ADMIN".equals(userRole)) {
        throw new RuntimeException("You do not have permission to delete this ticket");
    }

    ticketRepository.delete(ticket);
}
}
