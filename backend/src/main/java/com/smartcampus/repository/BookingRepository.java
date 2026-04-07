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
}
