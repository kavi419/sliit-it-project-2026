package com.smartcampus.repository;

import com.smartcampus.model.BookingEntity;
import com.smartcampus.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Booking operations.
 */
@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
    
    /**
     * Find all bookings for a specific user.
     */
    List<BookingEntity> findByUser(UserEntity user);
    
    /**
     * Find all bookings for a specific resource name.
     */
    List<BookingEntity> findByResourceName(String resourceName);

    /**
     * Conflict Check: Find any APPROVED bookings for the same resource that overlap
     * with the given time range.
     */
    @org.springframework.data.jpa.repository.Query("SELECT b FROM BookingEntity b WHERE b.resourceName = :resourceName " +
            "AND b.status = 'APPROVED' AND b.startTime < :endTime AND b.endTime > :startTime")
    List<BookingEntity> findOverlappingBookings(
            @org.springframework.data.repository.query.Param("resourceName") String resourceName,
            @org.springframework.data.repository.query.Param("startTime") java.time.LocalDateTime startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.LocalDateTime endTime);
}
