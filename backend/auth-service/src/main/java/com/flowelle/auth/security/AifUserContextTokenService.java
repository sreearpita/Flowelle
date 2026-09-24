package com.flowelle.auth.security;

import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateCrtKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.flowelle.auth.model.User;
import com.flowelle.auth.model.UserPreferences;

import io.jsonwebtoken.Jwts;

@Service
public class AifUserContextTokenService {
    private final String issuer;
    private final String audience;
    private final String tenant;
    private final String keyId;
    private final long lifetimeSeconds;
    private final String privateKeyBase64;

    public AifUserContextTokenService(
            @Value("${aif.user-context.issuer:flowelle}") String issuer,
            @Value("${aif.user-context.audience:ai-friend-chat}") String audience,
            @Value("${aif.user-context.tenant:flowelle}") String tenant,
            @Value("${aif.user-context.key-id:flowelle-aif-v1}") String keyId,
            @Value("${aif.user-context.lifetime-seconds:60}") long lifetimeSeconds,
            @Value("${aif.user-context.private-key-base64:}") String privateKeyBase64) {
        this.issuer = issuer;
        this.audience = audience;
        this.tenant = tenant;
        this.keyId = keyId;
        this.lifetimeSeconds = lifetimeSeconds;
        this.privateKeyBase64 = privateKeyBase64;
    }

    public String issue(User user, UserPreferences preferences) {
        if (user.getId() == null || preferences == null) {
            throw new IllegalStateException("User context requires an authenticated user and preferences");
        }
        long now = Instant.now().getEpochSecond();
        return Jwts.builder()
                .header().keyId(keyId).and()
                .issuer(issuer)
                .subject(user.getId().toString())
                .audience().add(audience).and()
                .issuedAt(java.util.Date.from(Instant.ofEpochSecond(now)))
                .expiration(java.util.Date.from(Instant.ofEpochSecond(now + lifetimeSeconds)))
                .id(UUID.randomUUID().toString())
                .claim("tenant", tenant)
                .claim("scope", "wellness:chat cycle:read preferences:read")
                .claim("aiCoachEnabled", Boolean.TRUE.equals(preferences.getAiCoachEnabled()))
                .signWith(privateKey(), Jwts.SIG.RS256)
                .compact();
    }

    public Map<String, Object> jwks() {
        RSAPrivateCrtKey privateKey = privateKey();
        return Map.of(
                "keys", java.util.List.of(Map.of(
                        "kty", "RSA",
                        "kid", keyId,
                        "use", "sig",
                        "alg", "RS256",
                        "n", Base64.getUrlEncoder().withoutPadding().encodeToString(unsigned(privateKey.getModulus().toByteArray())),
                        "e", Base64.getUrlEncoder().withoutPadding().encodeToString(unsigned(privateKey.getPublicExponent().toByteArray())))));
    }

    private RSAPrivateCrtKey privateKey() {
        if (privateKeyBase64 == null || privateKeyBase64.isBlank()) {
            throw new IllegalStateException("AI-Friend user-context private key is not configured");
        }
        try {
            return (RSAPrivateCrtKey) KeyFactory.getInstance("RSA")
                    .generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(privateKeyBase64)));
        } catch (Exception exception) {
            throw new IllegalStateException("AI-Friend user-context private key is invalid", exception);
        }
    }

    private byte[] unsigned(byte[] value) {
        return value.length > 1 && value[0] == 0
                ? java.util.Arrays.copyOfRange(value, 1, value.length)
                : value;
    }
}
