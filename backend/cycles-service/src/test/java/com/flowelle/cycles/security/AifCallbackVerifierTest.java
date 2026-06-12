package com.flowelle.cycles.security;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AifCallbackVerifierTest {

    @Test
    void verifiesKnownAiFriendSignatureVector() {
        AifCallbackVerifier verifier = new AifCallbackVerifier(
                "dev-v1",
                "secret",
                Clock.fixed(Instant.parse("2026-06-07T00:01:00Z"), ZoneOffset.UTC));

        assertThatCode(() -> verifier.verify(
                "dev-v1",
                "2026-06-07T00:00:00Z",
                "61d8139ea063c314927f82377accf25429264e2bccd97503d066ae9d43b2edb2",
                "{\"toolName\":\"cycle-summary\"}"))
                .doesNotThrowAnyException();
    }

    @Test
    void verifiesSharedSigningBodyFixture() {
        AifCallbackVerifier verifier = new AifCallbackVerifier(
                "dev-v1",
                "secret",
                Clock.fixed(Instant.parse("2026-06-07T00:01:00Z"), ZoneOffset.UTC));

        assertThatCode(() -> verifier.verify(
                "dev-v1",
                "2026-06-07T00:00:00Z",
                "61d8139ea063c314927f82377accf25429264e2bccd97503d066ae9d43b2edb2",
                "{\"toolName\":\"cycle-summary\"}"))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsExpiredTimestamp() {
        AifCallbackVerifier verifier = new AifCallbackVerifier(
                "dev-v1",
                "secret",
                Clock.fixed(Instant.parse("2026-06-07T00:10:00Z"), ZoneOffset.UTC));

        assertThatThrownBy(() -> verifier.verify(
                "dev-v1",
                "2026-06-07T00:00:00Z",
                "61d8139ea063c314927f82377accf25429264e2bccd97503d066ae9d43b2edb2",
                "{\"toolName\":\"cycle-summary\"}"))
                .isInstanceOf(AifCallbackUnauthorizedException.class)
                .hasMessageContaining("Expired AI-Friend callback timestamp");
    }

    @Test
    void rejectsInvalidSignature() {
        AifCallbackVerifier verifier = new AifCallbackVerifier(
                "dev-v1",
                "secret",
                Clock.fixed(Instant.parse("2026-06-07T00:01:00Z"), ZoneOffset.UTC));

        assertThatThrownBy(() -> verifier.verify(
                "dev-v1",
                "2026-06-07T00:00:00Z",
                "invalid",
                "{\"toolName\":\"cycle-summary\"}"))
                .isInstanceOf(AifCallbackUnauthorizedException.class)
                .hasMessageContaining("Invalid AI-Friend callback signature");
    }
}
