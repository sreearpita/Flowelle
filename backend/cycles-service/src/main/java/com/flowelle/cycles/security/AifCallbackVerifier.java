package com.flowelle.cycles.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.HexFormat;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AifCallbackVerifier {
    public static final String TENANT_HEADER = "X-AIF-Tenant";
    public static final String TIMESTAMP_HEADER = "X-AIF-Timestamp";
    public static final String SIGNATURE_HEADER = "X-AIF-Signature";
    public static final String REQUEST_ID_HEADER = "X-AIF-Request-Id";
    public static final String KEY_ID_HEADER = "X-AIF-Key-Id";

    private static final Duration MAX_CLOCK_SKEW = Duration.ofMinutes(5);

    private final Map<String, String> secretsByKeyId;
    private final Clock clock;

    public AifCallbackVerifier(
            @Value("${aif.callback.key-id:dev-v1}") String keyId,
            @Value("${aif.callback.secret:dev-aif-tool-secret}") String secret) {
        this(keyId, secret, Clock.systemUTC());
    }

    AifCallbackVerifier(String keyId, String secret, Clock clock) {
        this.secretsByKeyId = Map.of(keyId, secret);
        this.clock = clock;
    }

    public void verify(String keyId, String timestamp, String signature, String rawBody) {
        if (!StringUtils.hasText(keyId)
                || !StringUtils.hasText(timestamp)
                || !StringUtils.hasText(signature)
                || rawBody == null) {
            throw new AifCallbackUnauthorizedException("Missing AI-Friend callback signature headers");
        }

        String secret = secretsByKeyId.get(keyId);
        if (secret == null) {
            throw new AifCallbackUnauthorizedException("Unknown AI-Friend callback key id");
        }

        Instant requestTime;
        try {
            requestTime = Instant.parse(timestamp);
        } catch (DateTimeParseException exception) {
            throw new AifCallbackUnauthorizedException("Invalid AI-Friend callback timestamp");
        }

        if (Duration.between(requestTime, Instant.now(clock)).abs().compareTo(MAX_CLOCK_SKEW) > 0) {
            throw new AifCallbackUnauthorizedException("Expired AI-Friend callback timestamp");
        }

        String expected = sign(timestamp, rawBody, secret);
        if (!MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8))) {
            throw new AifCallbackUnauthorizedException("Invalid AI-Friend callback signature");
        }
    }

    private String sign(String timestamp, String body, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] signature = mac.doFinal((timestamp + "." + body).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(signature);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to verify AI-Friend callback signature", exception);
        }
    }
}
