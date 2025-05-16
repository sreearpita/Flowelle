package com.flowelle.cycles.controller;

import com.flowelle.cycles.dto.CycleDataDto;
import com.flowelle.cycles.service.CycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cycles")
@RequiredArgsConstructor
public class CycleController {

    private final CycleService cycleService;

    @GetMapping("/current")
    public ResponseEntity<CycleDataDto> getCurrentCycle(@RequestParam UUID userId) {
        CycleDataDto dto = cycleService.getCurrentCycle(userId);
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/history")
    public ResponseEntity<List<CycleDataDto>> getCycleHistory(@RequestParam UUID userId) {
        List<CycleDataDto> list = cycleService.getCycleHistory(userId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<CycleDataDto> startCycle(@RequestBody CycleDataDto cycleDto) {
        CycleDataDto created = cycleService.startCycle(cycleDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CycleDataDto> updateCycle(
            @PathVariable UUID id,
            @RequestBody CycleDataDto cycleDto) {
        CycleDataDto updated = cycleService.updateCycle(id, cycleDto);
        return ResponseEntity.ok(updated);
    }
} 