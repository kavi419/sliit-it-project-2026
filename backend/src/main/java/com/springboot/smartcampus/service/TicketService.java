package com.springboot.smartcampus.service;

import com.springboot.smartcampus.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TicketService {
    TicketResponse createTicket(CreateTicketRequest request, Long userId, List<MultipartFile> files);
    List<TicketResponse> getAllTickets();
    List<TicketResponse> getMyTickets(Long userId);
    List<TicketResponse> getAssignedTickets(Long techId);
    TicketResponse getTicketById(String id);
    TicketResponse updateStatus(String id, UpdateTicketStatusRequest request);
    TicketResponse assignTechnician(String id, AssignTechnicianRequest request);
    TicketResponse resolveTicket(String id, ResolveTicketRequest request);
    TicketCommentResponse addComment(String ticketId, AddCommentRequest request, Long authorId);
    TicketCommentResponse editComment(Long commentId, AddCommentRequest request, Long userId, String userRole);
    void deleteComment(Long commentId, Long userId, String userRole);
    List<TicketCommentResponse> getComments(String ticketId);
    List<TicketAttachmentResponse> getAttachments(String ticketId);
    TicketResponse updateTicket(String id, CreateTicketRequest request, Long userId, String userRole);
    void deleteTicket(String id, Long userId, String userRole);
}
