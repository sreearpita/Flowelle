package com.flowelle.auth.exception;

public class OpenAiSessionException extends RuntimeException {
    public OpenAiSessionException(String message, Throwable cause) {
        super(message, cause);
    }
}
