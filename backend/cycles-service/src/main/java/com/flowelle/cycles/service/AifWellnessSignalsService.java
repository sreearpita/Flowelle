package com.flowelle.cycles.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.flowelle.cycles.dto.DailyLogDto;
import com.flowelle.cycles.dto.FlowelleWellnessSignalsResponse;
import com.flowelle.cycles.dto.SymptomDto;
import com.flowelle.cycles.repository.DailyLogRepository;
import com.flowelle.cycles.repository.SymptomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AifWellnessSignalsService {
    private static final int MAX_DAILY_EVENTS = 31;
    private static final int MAX_SYMPTOM_EVENTS = 50;
    private static final Set<String> MOODS = Set.of("CALM", "HAPPY", "SAD", "ANXIOUS", "IRRITABLE", "STRESSED", "TIRED", "NEUTRAL");
    private final DailyLogRepository dailyLogRepository;
    private final SymptomRepository symptomRepository;

    public FlowelleWellnessSignalsResponse build(Long userId) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);
        List<DailyLogDto> logs = dailyLogRepository.findByUserIdAndDateBetweenOrderByDateAsc(userId, start, end)
                .stream().limit(MAX_DAILY_EVENTS).map(log -> DailyLogDto.builder()
                        .date(log.getDate().toString()).periodFlow(normalize(log.getPeriodFlow()))
                        .mood(normalizeMood(log.getMood())).energy(boundEnergy(log.getEnergy())).cycleId(log.getCycleId() == null ? null : log.getCycleId().toString()).build())
                .toList();
        if (logs.isEmpty()) return null;
        List<Long> cycleIds = logs.stream().map(DailyLogDto::getCycleId).filter(v -> v != null).map(Long::valueOf).toList();
        Map<Long, String> dates = logs.stream().filter(v -> v.getCycleId() != null).collect(Collectors.toMap(v -> Long.valueOf(v.getCycleId()), DailyLogDto::getDate, (a, b) -> a));
        List<FlowelleWellnessSignalsResponse.SymptomEvent> symptoms = symptomRepository.findByCycleIdIn(cycleIds).stream()
                .filter(symptom -> dates.containsKey(symptom.getCycleId()))
                .limit(MAX_SYMPTOM_EVENTS)
                .map(symptom -> new FlowelleWellnessSignalsResponse.SymptomEvent(symptom.getDate().toString(), normalize(symptom.getType()), boundSeverity(symptom.getSeverity())))
                .toList();
        List<FlowelleWellnessSignalsResponse.DailyEvent> daily = logs.stream()
                .map(log -> new FlowelleWellnessSignalsResponse.DailyEvent(log.getDate(), log.getPeriodFlow(), log.getMood(), log.getEnergy())).toList();
        return new FlowelleWellnessSignalsResponse(start.toString(), end.toString(), daily, symptoms,
                "Flowelle provided bounded recent wellness signals.", "I used your recent Flowelle wellness signals.");
    }

    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim().toUpperCase(); }
    private String normalizeMood(String value) { String normalized = normalize(value); return MOODS.contains(normalized) ? normalized : null; }
    private Integer boundEnergy(Integer value) { return value == null ? null : Math.max(1, Math.min(5, value)); }
    private Integer boundSeverity(Integer value) { return value == null ? null : Math.max(1, Math.min(5, value)); }
}
