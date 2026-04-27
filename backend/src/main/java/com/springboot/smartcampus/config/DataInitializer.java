package com.springboot.smartcampus.config;

import com.springboot.smartcampus.enums.ResourceStatus;
import com.springboot.smartcampus.model.Resource;
import com.springboot.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalTime;
import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ResourceRepository resourceRepository;
    private final com.springboot.smartcampus.repository.UserRepository userRepository;
    private final com.springboot.smartcampus.repository.BookingRepository bookingRepository;
    private final com.springboot.smartcampus.repository.TicketRepository ticketRepository;

    @Override
    public void run(String... args) throws Exception {
        if (resourceRepository.count() == 0) {
            Resource lab1 = Resource.builder()
                    .name("Main Computer Lab")
                    .type("Lab")
                    .capacity(50)
                    .location("Block A, Level 2")
                    .status(ResourceStatus.ACTIVE)
                    .availableFrom(LocalTime.of(8, 0))
                    .availableTo(LocalTime.of(18, 0))
                    .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800")
                    .description("High-performance computing lab for advanced projects.")
                    .build();

            Resource room1 = Resource.builder()
                    .name("Study Room 101")
                    .type("Study Room")
                    .capacity(6)
                    .location("Library, Level 1")
                    .status(ResourceStatus.ACTIVE)
                    .availableFrom(LocalTime.of(7, 0))
                    .availableTo(LocalTime.of(22, 0))
                    .imageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800")
                    .description("Quiet study space for small groups.")
                    .build();

            Resource auditorium = Resource.builder()
                    .name("Main Auditorium")
                    .type("Auditorium")
                    .capacity(300)
                    .location("Block B, Ground Floor")
                    .status(ResourceStatus.ACTIVE)
                    .availableFrom(LocalTime.of(8, 0))
                    .availableTo(LocalTime.of(20, 0))
                    .imageUrl("/images/auditorium.png")
                    .description("Large space for events and guest lectures.")
                    .build();

            resourceRepository.saveAll(Arrays.asList(lab1, room1, auditorium));
        } else {
            // Update Main Auditorium image if it already exists
            resourceRepository.findByNameIgnoreCase("Main Auditorium").ifPresent(res -> {
                res.setImageUrl("/images/auditorium.png");
                resourceRepository.save(res);
            });
        }

        // 1. Seed a System User if not exists
        com.springboot.smartcampus.model.User systemUser = userRepository.findByEmail("system@smartcampus.com")
                .orElseGet(() -> {
                    com.springboot.smartcampus.model.User u = com.springboot.smartcampus.model.User.builder()
                            .email("system@smartcampus.com")
                            .name("System Demo")
                            .role("STUDENT")
                            .status("ACTIVE")
                            .build();
                    return userRepository.save(u);
                });

        // 2. Seed a Pending Admin for the User Management table
        if (userRepository.findByEmail("pending.admin@test.com").isEmpty()) {
            userRepository.save(com.springboot.smartcampus.model.User.builder()
                    .email("pending.admin@test.com")
                    .name("Jane Doe (Pending)")
                    .role("ADMIN")
                    .status("PENDING_ADMIN")
                    .build());
        }

        // 3. Seed some Sample Bookings if empty
        if (bookingRepository.count() == 0) {
            Resource lab = resourceRepository.findAll().get(0);
            bookingRepository.save(com.springboot.smartcampus.model.Booking.builder()
                    .user(systemUser)
                    .resourceName(lab.getName())
                    .purpose("Group Project Meeting")
                    .attendeesCount(4)
                    .startTime(java.time.LocalDateTime.now().minusHours(1))
                    .endTime(java.time.LocalDateTime.now().plusHours(2))
                    .status("APPROVED")
                    .build());
            
            bookingRepository.save(com.springboot.smartcampus.model.Booking.builder()
                    .user(systemUser)
                    .resourceName("Study Room 101")
                    .purpose("Individual Study")
                    .attendeesCount(1)
                    .startTime(java.time.LocalDateTime.now().plusDays(1))
                    .endTime(java.time.LocalDateTime.now().plusDays(1).plusHours(2))
                    .status("PENDING")
                    .build());
        }

        // 4. Seed some Sample Tickets if empty
        if (ticketRepository.count() == 0) {
            ticketRepository.save(com.springboot.smartcampus.model.Ticket.builder()
                    .ticketCode("TCK-DEMO-01")
                    .title("Projector Not Working")
                    .description("The projector in Lab A is not turning on. Tried different cables.")
                    .category(com.springboot.smartcampus.enums.TicketCategory.EQUIPMENT)
                    .priority(com.springboot.smartcampus.enums.TicketPriority.HIGH)
                    .status(com.springboot.smartcampus.enums.TicketStatus.OPEN)
                    .location("Block A, Level 2")
                    .createdBy(systemUser)
                    .build());
        }
    }
}
