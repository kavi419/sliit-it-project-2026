package com.springboot.smartcampus.repository;

import com.springboot.smartcampus.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
    List<Ticket> findAllByOrderByCreatedAtDesc();
    java.util.Optional<Ticket> findByTicketCode(String ticketCode);
    List<Ticket> findByAssignedTechnicianIdOrderByCreatedAtDesc(Long technicianId);
}
