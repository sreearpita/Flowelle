package com.flowelle.cycles.service;

import com.flowelle.cycles.dto.SymptomDto;
import com.flowelle.cycles.model.Symptom;
import com.flowelle.cycles.repository.SymptomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SymptomService {
    private final SymptomRepository symptomRepository;

    public SymptomDto logSymptom(SymptomDto dto) {
        Symptom symptom = Symptom.builder()
                .cycleId(UUID.fromString(dto.getCycleId()))
                .type(dto.getType())
                .severity(dto.getSeverity())
                .date(LocalDate.parse(dto.getDate()))
                .notes(dto.getNotes())
                .build();
        Symptom saved = symptomRepository.save(symptom);
        return toDto(saved);
    }

    public SymptomDto updateSymptom(UUID id, SymptomDto dto) {
        Symptom symptom = symptomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Symptom not found"));
        symptom.setType(dto.getType());
        symptom.setSeverity(dto.getSeverity());
        symptom.setDate(LocalDate.parse(dto.getDate()));
        symptom.setNotes(dto.getNotes());
        Symptom updated = symptomRepository.save(symptom);
        return toDto(updated);
    }

    public void deleteSymptom(UUID id) {
        symptomRepository.deleteById(id);
    }

    public List<SymptomDto> getSymptomsByCycle(UUID cycleId) {
        return symptomRepository.findByCycleId(cycleId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private SymptomDto toDto(Symptom s) {
        return SymptomDto.builder()
                .id(s.getId().toString())
                .cycleId(s.getCycleId().toString())
                .type(s.getType())
                .severity(s.getSeverity())
                .date(s.getDate().toString())
                .notes(s.getNotes())
                .build();
    }
} 