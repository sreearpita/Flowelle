package com.flowelle.cycles.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymptomDto {
    private String id;
    private String cycleId;
    private String type;
    private Integer severity;
    private String date;
    private String notes;
} 