package com.flowelle.cycles.service;

import com.flowelle.cycles.dto.CycleExportDto;
import com.flowelle.cycles.dto.DailyLogDto;
import com.flowelle.cycles.dto.SymptomDto;
import com.flowelle.cycles.model.Cycle;
import com.flowelle.cycles.model.DailyLog;
import com.flowelle.cycles.repository.CycleRepository;
import com.flowelle.cycles.repository.DailyLogRepository;
import com.flowelle.cycles.repository.SymptomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DailyLogService {
    private final DailyLogRepository dailyLogRepository;
    private final CycleRepository cycleRepository;
    private final SymptomRepository symptomRepository;
    private final SymptomService symptomService;
    private final CycleService cycleService;
    private final PredictionService predictionService;

    @Transactional
    public DailyLogDto saveLog(DailyLogDto dto) {
        Long userId = Long.parseLong(dto.getUserId());
        Long cycleId = resolveCycleId(userId, dto.getCycleId());

        DailyLog log = DailyLog.builder()
                .userId(userId)
                .cycleId(cycleId)
                .date(LocalDate.parse(dto.getDate()))
                .periodFlow(dto.getPeriodFlow())
                .mood(dto.getMood())
                .energy(dto.getEnergy())
                .notes(dto.getNotes())
                .source(dto.getSource() == null || dto.getSource().isBlank() ? "manual" : dto.getSource())
                .build();

        DailyLog saved = dailyLogRepository.save(log);

        if (cycleId != null && dto.getSymptoms() != null) {
            for (SymptomDto symptom : dto.getSymptoms()) {
                symptom.setCycleId(cycleId.toString());
                symptom.setDate(dto.getDate());
                symptomService.logSymptom(symptom);
            }
        }

        return toDto(saved);
    }

    public List<DailyLogDto> getLogs(Long userId, String from, String to) {
        if (from != null && to != null) {
            return dailyLogRepository
                    .findByUserIdAndDateBetweenOrderByDateAsc(userId, LocalDate.parse(from), LocalDate.parse(to))
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        return dailyLogRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CycleExportDto exportUserData(Long userId) {
        CycleExportDto.CycleExportDtoBuilder builder = CycleExportDto.builder()
                .generatedAt(LocalDateTime.now().toString())
                .userId(userId.toString())
                .cycles(cycleService.getCycleHistory(userId))
                .logs(getLogs(userId, null, null));

        try {
            builder.predictions(predictionService.predictNextCycle(userId));
        } catch (RuntimeException ignored) {
            builder.predictions(null);
        }

        return builder.build();
    }

    @Transactional
    public void deleteUserData(Long userId) {
        List<Long> cycleIds = cycleRepository.findByUserId(userId).stream()
                .map(Cycle::getId)
                .collect(Collectors.toList());

        if (!cycleIds.isEmpty()) {
            symptomRepository.deleteByCycleIdIn(cycleIds);
        }
        dailyLogRepository.deleteByUserId(userId);
        cycleRepository.deleteByUserId(userId);
    }

    private Long resolveCycleId(Long userId, String cycleId) {
        if (cycleId != null && !cycleId.isBlank()) {
            return Long.parseLong(cycleId);
        }

        Optional<Cycle> currentCycle = cycleRepository.findByUserId(userId).stream()
                .max(Comparator.comparing(Cycle::getStartDate));
        return currentCycle.map(Cycle::getId).orElse(null);
    }

    private DailyLogDto toDto(DailyLog log) {
        List<SymptomDto> symptoms = log.getCycleId() == null
                ? List.of()
                : symptomService.getSymptomsByCycle(log.getCycleId()).stream()
                        .filter(symptom -> log.getDate().toString().equals(symptom.getDate()))
                        .collect(Collectors.toList());

        return DailyLogDto.builder()
                .id(log.getId().toString())
                .userId(log.getUserId().toString())
                .cycleId(log.getCycleId() != null ? log.getCycleId().toString() : null)
                .date(log.getDate().toString())
                .periodFlow(log.getPeriodFlow())
                .mood(log.getMood())
                .energy(log.getEnergy())
                .notes(log.getNotes())
                .source(log.getSource())
                .createdAt(log.getCreatedAt() != null ? log.getCreatedAt().toString() : null)
                .symptoms(symptoms)
                .build();
    }
}
