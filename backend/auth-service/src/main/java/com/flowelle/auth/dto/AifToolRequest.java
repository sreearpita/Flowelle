package com.flowelle.auth.dto;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

public record AifToolRequest(
        UUID requestId,
        String tenantSlug,
        String externalUserId,
        UUID sessionId,
        String toolName,
        Set<String> scopes,
        String locale,
        Map<String, Object> parameters) {
}
