package com.flowelle.cycles.controller;

import com.flowelle.cycles.dto.SymptomDto;
import com.flowelle.cycles.service.SymptomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/symptoms")
@RequiredArgsConstructor
public class SymptomController {
    private final SymptomService symptomService;

    @PostMapping
    public ResponseEntity<SymptomDto> logSymptom(@RequestBody SymptomDto dto) {
        SymptomDto saved = symptomService.logSymptom(dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SymptomDto> updateSymptom(
            @PathVariable UUID id,
            @RequestBody SymptomDto dto) {
        SymptomDto updated = symptomService.updateSymptom(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSymptom(@PathVariable UUID id) {
        symptomService.deleteSymptom(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cycle/{cycleId}")
    public ResponseEntity<List<SymptomDto>> getByCycle(@PathVariable UUID cycleId) {
        List<SymptomDto> list = symptomService.getSymptomsByCycle(cycleId);
        return ResponseEntity.ok(list);
    }
} 