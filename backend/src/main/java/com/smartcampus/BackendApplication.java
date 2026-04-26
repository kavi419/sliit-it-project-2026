package com.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import com.smartcampus.repository.UserRepository;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner initAdmin(UserRepository userRepository) {
		return args -> {
			java.util.Set<String> adminEmails = java.util.Set.of(
				"Sachininisansala320@gmail.com",
				"shakyasandali039@gmail.com"
			);
			
			userRepository.findAll().forEach(u -> {
				boolean isAuthorized = u.getEmail().toLowerCase().startsWith("kavindunethmina") || 
					adminEmails.stream().anyMatch(e -> e.equalsIgnoreCase(u.getEmail()));
				
				if (isAuthorized) {
					if (!"ADMIN".equals(u.getRole())) {
						u.setRole("ADMIN");
						userRepository.save(u);
						System.out.println("Ensured ADMIN role for: " + u.getEmail());
					}
				} else {
					if ("ADMIN".equals(u.getRole())) {
						u.setRole("STUDENT");
						userRepository.save(u);
						System.out.println("Demoted unauthorized ADMIN to STUDENT: " + u.getEmail());
					}
				}
			});
		};
	}
}
