package com.flowelle.cycles.service;

import com.flowelle.cycles.dto.CycleDataDto;
import com.flowelle.cycles.dto.CycleDayDto;
import com.flowelle.cycles.dto.SymptomDto;
import com.flowelle.cycles.model.Cycle;
import com.flowelle.cycles.repository.CycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CycleService {
    private final CycleRepository cycleRepository;
    private final SymptomService symptomService;

    public CycleDataDto getCurrentCycle(Long userId) {
        // Find the most recent cycle for a user (for simplicity, assume sorted by startDate)
        return cycleRepository.findByUserId(userId).stream()
                .max((c1, c2) -> c1.getStartDate().compareTo(c2.getStartDate()))
                .map(this::toDto)
                .orElse(null);
    }

    public List<CycleDataDto> getCycleHistory(Long userId) {
        return cycleRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CycleDataDto startCycle(CycleDataDto cycleDto) {
        Cycle cycle = Cycle.builder()
                .userId(Long.parseLong(cycleDto.getUserId()))
                .startDate(LocalDate.parse(cycleDto.getStartDate()))
                .endDate(cycleDto.getEndDate() != null ? LocalDate.parse(cycleDto.getEndDate()) : null)
                .periodLength(cycleDto.getPeriodLength())
                .cycleLength(cycleDto.getCycleLength())
                .notes(cycleDto.getNotes())
                .build();
        Cycle saved = cycleRepository.save(cycle);
        return toDto(saved);
    }

    public CycleDataDto updateCycle(Long id, CycleDataDto cycleDto) {
        Cycle cycle = cycleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));
        cycle.setEndDate(cycleDto.getEndDate() != null ? LocalDate.parse(cycleDto.getEndDate()) : null);
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
                .userId(cycle.getUserId().toString())
                .startDate(cycle.getStartDate().toString())
                .endDate(cycle.getEndDate() != null ? cycle.getEndDate().toString() : null)
                .periodLength(cycle.getPeriodLength())
                .cycleLength(cycle.getCycleLength())
                .notes(cycle.getNotes())
                .days(days)
                .build();
    }
} 