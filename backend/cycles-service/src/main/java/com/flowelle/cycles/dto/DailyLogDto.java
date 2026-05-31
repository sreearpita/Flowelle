package com.flowelle.cycles.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyLogDto {
    private String id;
    private String userId;
    private String cycleId;
    private String date;
    private String periodFlow;
    private String mood;
    private Integer energy;
    private String notes;
    private String source;
    private String createdAt;

    @Builder.Default
    private List<SymptomDto> symptoms = new ArrayList<>();
}
