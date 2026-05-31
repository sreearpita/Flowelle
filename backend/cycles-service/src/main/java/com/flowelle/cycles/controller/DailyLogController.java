package com.flowelle.cycles.controller;

import com.flowelle.cycles.dto.CycleExportDto;
import com.flowelle.cycles.dto.DailyLogDto;
import com.flowelle.cycles.service.DailyLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cycles")
@RequiredArgsConstructor
public class DailyLogController {
    private final DailyLogService dailyLogService;

    @PostMapping("/logs")
    public ResponseEntity<DailyLogDto> saveLog(@RequestBody DailyLogDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dailyLogService.saveLog(dto));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<DailyLogDto>> getLogs(
            @RequestParam Long userId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        return ResponseEntity.ok(dailyLogService.getLogs(userId, from, to));
    }

    @GetMapping("/export")
    public ResponseEntity<CycleExportDto> exportUserData(@RequestParam Long userId) {
        return ResponseEntity.ok(dailyLogService.exportUserData(userId));
    }

    @DeleteMapping("/data")
    public ResponseEntity<Void> deleteUserData(@RequestParam Long userId) {
        dailyLogService.deleteUserData(userId);
        return ResponseEntity.noContent().build();
    }
}
