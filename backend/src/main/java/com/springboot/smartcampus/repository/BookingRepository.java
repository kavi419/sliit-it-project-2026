package com.springboot.smartcampus.repository;

import com.springboot.smartcampus.model.Booking;
import com.springboot.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Booking operations.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    /**
     * Find all bookings for a specific user.
     */
    List<Booking> findByUser(User user);
    
    /**
     * Find all bookings for a specific resource name.
     */
    List<Booking> findByResourceName(String resourceName);

    /**
     * Conflict Check: Find any APPROVED bookings for the same resource that overlap
     * with the given time range.
     */
    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.resourceName = :resourceName " +
            "AND b.status = 'APPROVED' AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(
            @org.springframework.data.repository.query.Param("resourceName") String resourceName,
            @org.springframework.data.repository.query.Param("startTime") java.time.LocalDateTime startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.LocalDateTime endTime);
    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.resourceName = :resourceName " +
            "AND b.status = 'APPROVED' AND b.id <> :excludeId AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookingsExcluding(
            @org.springframework.data.repository.query.Param("resourceName") String resourceName,
            @org.springframework.data.repository.query.Param("startTime") java.time.LocalDateTime startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.LocalDateTime endTime,
            @org.springframework.data.repository.query.Param("excludeId") Long excludeId);
    @org.springframework.data.jpa.repository.Query("SELECT b.resourceName, COUNT(b) FROM Booking b GROUP BY b.resourceName ORDER BY COUNT(b) DESC")
    List<Object[]> countBookingsByResource();

    @org.springframework.data.jpa.repository.Query(value = "SELECT TRIM(TO_CHAR(start_time, 'Day')) as day, COUNT(*) FROM bookings GROUP BY day ORDER BY COUNT(*) DESC", nativeQuery = true)
    List<Object[]> countBookingsByDayOfWeek();
}
