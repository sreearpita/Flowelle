package com.flowelle.cycles.controller;

import com.flowelle.cycles.dto.CycleDataDto;
import com.flowelle.cycles.service.CycleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/cycles")
@RequiredArgsConstructor
public class CycleController {

    private final CycleService cycleService;

    @GetMapping("/current")
    public ResponseEntity<CycleDataDto> getCurrentCycle(@RequestParam Long userId) {
        CycleDataDto dto = cycleService.getCurrentCycle(userId);
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/history")
    public ResponseEntity<List<CycleDataDto>> getCycleHistory(@RequestParam Long userId) {
        List<CycleDataDto> list = cycleService.getCycleHistory(userId);
        if (list.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<CycleDataDto> startCycle(@Valid @RequestBody CycleDataDto cycleDto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(", "));
            log.error("Validation errors in startCycle: {}", errors);
            return ResponseEntity.badRequest().build();
        }
        
        try {
            log.debug("Starting new cycle with data: {}", cycleDto);
            CycleDataDto created = cycleService.startCycle(cycleDto);
            log.debug("Successfully created cycle: {}", created);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            log.error("Error creating cycle: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CycleDataDto> updateCycle(
            @PathVariable Long id,
            @Valid @RequestBody CycleDataDto cycleDto,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(", "));
            log.error("Validation errors in updateCycle: {}", errors);
            return ResponseEntity.badRequest().build();
        }
        
        try {
            log.debug("Updating cycle {} with data: {}", id, cycleDto);
            CycleDataDto updated = cycleService.updateCycle(id, cycleDto);
            log.debug("Successfully updated cycle: {}", updated);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.error("Error updating cycle {}: {}", id, e.getMessage());
            if (e.getMessage().equals("Cycle not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }
} 