package com.flowelle.cycles.controller;

import com.flowelle.cycles.dto.CyclePredictionsDto;
import com.flowelle.cycles.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/cycles")
@RequiredArgsConstructor
public class PredictionController {
    private final PredictionService predictionService;

    @GetMapping("/predictions")
    public ResponseEntity<CyclePredictionsDto> getPredictions(@RequestParam UUID userId) {
        CyclePredictionsDto dto = predictionService.predictNextCycle(userId);
        return ResponseEntity.ok(dto);
    }
} 