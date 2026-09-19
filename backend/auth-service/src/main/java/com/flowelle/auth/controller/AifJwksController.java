package com.flowelle.auth.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowelle.auth.security.AifUserContextTokenService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/.well-known")
@RequiredArgsConstructor
public class AifJwksController {
    private final AifUserContextTokenService tokenService;

    @GetMapping("/jwks.json")
    public Map<String, Object> jwks() {
        return tokenService.jwks();
    }
}
