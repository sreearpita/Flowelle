package com.flowelle.auth.security;

public class AifCallbackUnauthorizedException extends RuntimeException {
    public AifCallbackUnauthorizedException(String message) {
        super(message);
    }
}
