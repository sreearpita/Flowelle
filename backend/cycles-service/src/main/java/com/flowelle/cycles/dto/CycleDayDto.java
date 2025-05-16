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
public class CycleDayDto {
    private String date;
    private List<SymptomDto> symptoms;
    private String notes;
} 