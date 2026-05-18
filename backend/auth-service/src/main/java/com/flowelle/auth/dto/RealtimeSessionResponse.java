package com.flowelle.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class RealtimeSessionResponse {
    private Map<String, Object> session;
}
