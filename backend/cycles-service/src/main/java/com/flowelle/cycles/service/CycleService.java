package com.flowelle.cycles.service;

import com.flowelle.cycles.dto.CycleDataDto;
import com.flowelle.cycles.dto.CycleDayDto;
import com.flowelle.cycles.dto.SymptomDto;
import com.flowelle.cycles.model.Cycle;
import com.flowelle.cycles.repository.CycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CycleService {
    private final CycleRepository cycleRepository;
    private final SymptomService symptomService;

    public CycleDataDto getCurrentCycle(UUID userId) {
        // Find the most recent cycle for a user (for simplicity, assume sorted by startDate)
        return cycleRepository.findByUserId(userId).stream()
                .max((c1, c2) -> c1.getStartDate().compareTo(c2.getStartDate()))
                .map(this::toDto)
                .orElse(null);
    }

    public List<CycleDataDto> getCycleHistory(UUID userId) {
        return cycleRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CycleDataDto startCycle(CycleDataDto cycleDto) {
        Cycle cycle = Cycle.builder()
                .id(UUID.fromString(cycleDto.getId()))
                .userId(UUID.fromString(cycleDto.getDays().get(0).getDate()))
                .startDate(LocalDateTime.parse(cycleDto.getStartDate()).toLocalDate())
                .endDate(cycleDto.getEndDate() != null ? LocalDateTime.parse(cycleDto.getEndDate()).toLocalDate() : null)
                .periodLength(cycleDto.getPeriodLength())
                .cycleLength(cycleDto.getCycleLength())
                .notes(cycleDto.getNotes())
                .build();
        Cycle saved = cycleRepository.save(cycle);
        return toDto(saved);
    }

    public CycleDataDto updateCycle(UUID id, CycleDataDto cycleDto) {
        Cycle cycle = cycleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));
        cycle.setEndDate(cycleDto.getEndDate() != null ? LocalDateTime.parse(cycleDto.getEndDate()).toLocalDate() : null);
        cycle.setPeriodLength(cycleDto.getPeriodLength());
        cycle.setCycleLength(cycleDto.getCycleLength());
        cycle.setNotes(cycleDto.getNotes());
        Cycle updated = cycleRepository.save(cycle);
        return toDto(updated);
    }

    private CycleDataDto toDto(Cycle cycle) {
        // Fetch all symptoms for this cycle and group by date
        List<SymptomDto> symptoms = symptomService.getSymptomsByCycle(cycle.getId());
        Map<String, List<SymptomDto>> grouped = symptoms.stream()
                .collect(Collectors.groupingBy(SymptomDto::getDate));

        List<CycleDayDto> days = grouped.entrySet().stream()
                .map(entry -> CycleDayDto.builder()
                        .date(entry.getKey())
                        .symptoms(entry.getValue())
                        .notes(null)
                        .build())
                .collect(Collectors.toList());

        return CycleDataDto.builder()
                .id(cycle.getId().toString())
                .startDate(cycle.getStartDate().toString())
                .endDate(cycle.getEndDate() != null ? cycle.getEndDate().toString() : null)
                .periodLength(cycle.getPeriodLength())
                .cycleLength(cycle.getCycleLength())
                .notes(cycle.getNotes())
                .days(days)
                .build();
    }
} 