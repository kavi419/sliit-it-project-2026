package com.smartcampus.repository;

import com.smartcampus.model.TicketAttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachmentEntity, Long> {
    List<TicketAttachmentEntity> findByTicketId(Long ticketId);
}
