package com.flowelle.auth.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.util.Base64;

import org.junit.jupiter.api.Test;

import com.flowelle.auth.model.User;
import com.flowelle.auth.model.UserPreferences;
import com.fasterxml.jackson.databind.ObjectMapper;

class AifUserContextTokenServiceTest {
    @Test
    void issuesNumericSubjectConsentAndExpectedScopes() throws Exception {
        var generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        RSAPrivateKey privateKey = (RSAPrivateKey) generator.generateKeyPair().getPrivate();
        var service = new AifUserContextTokenService(
                "https://flowelle.example",
                "ai-friend-chat",
                "flowelle",
                "flowelle-test-v1",
                60,
                Base64.getEncoder().encodeToString(privateKey.getEncoded()));
        User user = User.builder().id(42L).email("user@example.com").build();
        UserPreferences preferences = UserPreferences.builder().aiCoachEnabled(true).build();

        String token = service.issue(user, preferences);
        String payload = token.split("\\.")[1];
        var claims = new ObjectMapper().readTree(Base64.getUrlDecoder().decode(payload));

        assertThat(claims.get("sub").asText()).isEqualTo("42");
        assertThat(claims.get("aud").isArray()).isTrue();
        assertThat(claims.get("aud")).anyMatch(value -> value.asText().equals("ai-friend-chat"));
        assertThat(claims.get("tenant").asText()).isEqualTo("flowelle");
        assertThat(claims.get("aiCoachEnabled").asBoolean()).isTrue();
        assertThat(claims.get("scope").asText()).contains("wellness:chat", "cycle:read", "preferences:read");
        assertThat(service.jwks().toString()).contains("flowelle-test-v1");
    }
}
