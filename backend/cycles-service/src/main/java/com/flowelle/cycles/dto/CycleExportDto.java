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
public class CycleExportDto {
    private String generatedAt;
    private String userId;

    @Builder.Default
    private List<CycleDataDto> cycles = new ArrayList<>();

    @Builder.Default
    private List<DailyLogDto> logs = new ArrayList<>();

    private CyclePredictionsDto predictions;
}
