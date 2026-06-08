package com.flowelle.cycles.service;

import java.util.Optional;

import com.flowelle.cycles.dto.AifToolRequest;
import com.flowelle.cycles.dto.CycleDataDto;
import com.flowelle.cycles.dto.CyclePredictionsDto;
import com.flowelle.cycles.dto.FlowelleCycleSummaryResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AifCycleToolService {
    private final PredictionService predictionService;
    private final CycleService cycleService;

    public Optional<FlowelleCycleSummaryResponse> buildCycleSummary(AifToolRequest request) {
        Long userId = parseUserId(request.externalUserId());
        CycleDataDto currentCycle = cycleService.getCurrentCycle(userId);
        if (currentCycle == null) {
            return Optional.empty();
        }

        CyclePredictionsDto prediction = predictionService.predictNextCycle(userId);
        String summary = "Predicted next period starts " + prediction.getNextPeriod()
                + " with confidence " + prediction.getConfidence() + "%.";

        return Optional.of(new FlowelleCycleSummaryResponse(
                prediction.getNextPeriod(),
                prediction.getFertileWindowStart(),
                prediction.getFertileWindowEnd(),
                prediction.getOvulationDay(),
                prediction.getConfidence(),
                prediction.getBasis(),
                prediction.getIsPredicted(),
                currentCycle.getCycleLength(),
                currentCycle.getPeriodLength(),
                summary,
                "I used your Flowelle cycle summary."));
    }

    private Long parseUserId(String externalUserId) {
        try {
            return Long.parseLong(externalUserId);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("externalUserId must be a Flowelle numeric user id");
        }
    }
}
