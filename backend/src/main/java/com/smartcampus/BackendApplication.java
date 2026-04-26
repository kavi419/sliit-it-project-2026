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
				if (u.getEmail().toLowerCase().startsWith("kavindunethmina") || 
					adminEmails.stream().anyMatch(e -> e.equalsIgnoreCase(u.getEmail()))) {
					u.setRole("ADMIN");
					userRepository.save(u);
					System.out.println("Ensured ADMIN role for: " + u.getEmail());
				}
			});
		};
	}
}
