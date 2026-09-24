package com.flowelle.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import com.flowelle.auth.dto.AifChatMessageRequest;
import com.flowelle.auth.model.User;
import com.flowelle.auth.model.UserPreferences;
import com.flowelle.auth.security.AifUserContextTokenService;

class AifChatProxyServiceTest {
    @Test
    void stripsHopByHopResponseHeadersBeforeReturningProxyResponse() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        AifUserContextTokenService tokenService = mock(AifUserContextTokenService.class);
        Map responseBody = Map.of("message", "ok");
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.TRANSFER_ENCODING, "chunked");

        when(tokenService.issue(any(User.class), any(UserPreferences.class))).thenReturn("signed-context");
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(new ResponseEntity(responseBody, responseHeaders, HttpStatus.OK));

        AifChatProxyService service = new AifChatProxyService(
                restTemplate,
                tokenService,
                "http://ai-friend",
                "tenant-key");

        ResponseEntity<Map> response = service.forward(
                new AifChatMessageRequest(UUID.randomUUID(), "Hello", "en"),
                User.builder().id(42L).email("user@example.com").build(),
                UserPreferences.builder().userId(42L).aiCoachEnabled(true).build());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseBody);
        assertThat(response.getHeaders()).doesNotContainKey(HttpHeaders.TRANSFER_ENCODING);
    }
}
