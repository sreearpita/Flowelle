package com.flowelle.cycles.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CyclePredictionsDto {
    private String nextPeriod;
    private String fertileWindowStart;
    private String fertileWindowEnd;
    private String ovulationDay;
} 