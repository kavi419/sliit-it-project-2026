package com.springboot.smartcampus;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
	"spring.security.oauth2.client.registration.google.client-id=test-client-id",
	"spring.security.oauth2.client.registration.google.client-secret=test-client-secret",
	"spring.security.oauth2.client.registration.google.scope=profile,email",
	"spring.security.oauth2.client.registration.google.authorization-grant-type=authorization_code",
	"spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}",
	"spring.security.oauth2.client.registration.google.client-name=Google",
	"spring.security.oauth2.client.provider.google.authorization-uri=https://accounts.google.com/o/oauth2/auth",
	"spring.security.oauth2.client.provider.google.token-uri=https://oauth2.googleapis.com/token",
	"spring.security.oauth2.client.provider.google.user-info-uri=https://www.googleapis.com/oauth2/v3/userinfo",
	"spring.security.oauth2.client.provider.google.user-name-attribute=sub",
	"spring.jpa.hibernate.ddl-auto=none",
	"spring.sql.init.mode=never"
})
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
