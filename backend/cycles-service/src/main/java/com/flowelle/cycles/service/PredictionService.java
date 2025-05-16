package com.flowelle.cycles.service;

import com.flowelle.cycles.dto.CyclePredictionsDto;
import com.flowelle.cycles.model.Cycle;
import com.flowelle.cycles.repository.CycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PredictionService {
    private final CycleRepository cycleRepository;

    public CyclePredictionsDto predictNextCycle(UUID userId) {
        // Fetch the most recent cycle
        Cycle cycle = cycleRepository.findByUserId(userId).stream()
                .max((c1, c2) -> c1.getStartDate().compareTo(c2.getStartDate()))
                .orElseThrow(() -> new RuntimeException("No cycles found for user"));

        LocalDate start = cycle.getStartDate();
        int cycleLen = cycle.getCycleLength() != null ? cycle.getCycleLength() : 28;
        int periodLen = cycle.getPeriodLength() != null ? cycle.getPeriodLength() : 5;

        // Simple prediction algorithm
        LocalDate nextPeriod = start.plusDays(cycleLen);
        // Assume ovulation 14 days before next period
        LocalDate ovulationDay = nextPeriod.minusDays(14);
        // Fertile window 5 days before ovulation to 1 day after
        LocalDate fertileStart = ovulationDay.minusDays(5);
        LocalDate fertileEnd = ovulationDay.plusDays(1);

        return CyclePredictionsDto.builder()
                .nextPeriod(nextPeriod.toString())
                .ovulationDay(ovulationDay.toString())
                .fertileWindowStart(fertileStart.toString())
                .fertileWindowEnd(fertileEnd.toString())
                .build();
    }
} 