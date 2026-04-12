package com.smartcampus.repository;

import com.smartcampus.model.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<TicketEntity, Long> {
    List<TicketEntity> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
    List<TicketEntity> findAllByOrderByCreatedAtDesc();
    java.util.Optional<TicketEntity> findByTicketCode(String ticketCode);
}
