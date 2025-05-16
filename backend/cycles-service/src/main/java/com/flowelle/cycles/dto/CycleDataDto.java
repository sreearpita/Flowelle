package com.flowelle.cycles.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CycleDataDto {
    private String id;
    private String userId;
    private String startDate;
    private String endDate;
    private Integer periodLength;
    private Integer cycleLength;
    private String notes;
    private List<CycleDayDto> days;
} 