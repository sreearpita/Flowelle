package com.flowelle.cycles.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CycleDataDto {
    private String id;

    @NotNull(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Start date is required")
    private String startDate;

    private String endDate;

    @NotNull(message = "Period length is required")
    private Integer periodLength;

    @NotNull(message = "Cycle length is required")
    private Integer cycleLength;

    private String notes;

    @Builder.Default
    private List<CycleDayDto> days = new ArrayList<>();
}