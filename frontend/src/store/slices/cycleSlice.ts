import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CycleState, CycleData, CycleDay, Symptom, CyclePredictions } from '../../types/cycle';
import cycleService from '../../services/cycle.service';

const initialState: CycleState = {
  currentCycle: null,
  cycleHistory: [],
  predictions: null,
  isLoading: false,
  error: null,
};

export const getCurrentCycle = createAsyncThunk<CycleData>(
  'cycle/getCurrentCycle',
  async () => {
    return await cycleService.getCurrentCycle();
  }
);

export const getCycleHistory = createAsyncThunk<CycleData[]>(
  'cycle/getCycleHistory',
  async () => {
    return await cycleService.getCycleHistory();
  }
);

export const logSymptom = createAsyncThunk<Symptom, Omit<Symptom, 'id'>>(
  'cycle/logSymptom',
  async (symptom) => {
    return await cycleService.logSymptom(symptom);
  }
);

export const updateSymptom = createAsyncThunk<Symptom, Symptom>(
  'cycle/updateSymptom',
  async (symptom) => {
    return await cycleService.updateSymptom(symptom);
  }
);

export const deleteSymptom = createAsyncThunk<void, string>(
  'cycle/deleteSymptom',
  async (symptomId) => {
    await cycleService.deleteSymptom(symptomId);
  }
);

export const updateCycleDay = createAsyncThunk<
  CycleDay,
  { date: string; data: Partial<CycleDay> }
>('cycle/updateCycleDay', async ({ date, data }) => {
  return await cycleService.updateCycleDay(date, data);
});

export const getPredictions = createAsyncThunk<CyclePredictions>(
  'cycle/getPredictions',
  async () => {
    return await cycleService.predictNextPeriod();
  }
);

const cycleSlice = createSlice({
  name: 'cycle',
  initialState,
  reducers: {
    clearCycleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Current Cycle
      .addCase(getCurrentCycle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentCycle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCycle = action.payload;
      })
      .addCase(getCurrentCycle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch current cycle';
      })
      // Get Cycle History
      .addCase(getCycleHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCycleHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cycleHistory = action.payload;
      })
      .addCase(getCycleHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch cycle history';
      })
      // Log Symptom
      .addCase(logSymptom.fulfilled, (state, action) => {
        if (state.currentCycle) {
          const day = state.currentCycle.days.find(
            (d) => d.date === action.payload.date
          );
          if (day) {
            day.symptoms.push(action.payload);
          } else {
            state.currentCycle.days.push({ date: action.payload.date, symptoms: [action.payload] });
          }
        }
      })
      .addCase(logSymptom.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to log symptom';
      })
      // Update Symptom
      .addCase(updateSymptom.fulfilled, (state, action) => {
        if (state.currentCycle) {
          const day = state.currentCycle.days.find(
            (d) => d.date === action.payload.date
          );
          if (day) {
            const index = day.symptoms.findIndex((s) => s.id === action.payload.id);
            if (index !== -1) {
              day.symptoms[index] = action.payload;
            }
          }
        }
      })
      .addCase(updateSymptom.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update symptom';
      })
      // Delete Symptom
      .addCase(deleteSymptom.fulfilled, (state, action) => {
        console.warn('Symptom deletion in state needs refinement.');
      })
      .addCase(deleteSymptom.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete symptom';
      })
      // Update Cycle Day
      .addCase(updateCycleDay.fulfilled, (state, action) => {
        if (state.currentCycle) {
          const index = state.currentCycle.days.findIndex(d => d.date === action.payload.date);
          if (index !== -1) {
            state.currentCycle.days[index] = { ...state.currentCycle.days[index], ...action.payload };
          }
        }
      })
      .addCase(updateCycleDay.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update cycle day';
      })
      // Get Predictions
      .addCase(getPredictions.fulfilled, (state, action) => {
        state.predictions = action.payload;
      })
      .addCase(getPredictions.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch predictions';
      });
  },
});

export const { clearCycleError } = cycleSlice.actions;
export default cycleSlice.reducer; 