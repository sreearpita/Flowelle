import { addDays, differenceInDays, format, isWithinInterval, parseISO } from 'date-fns';
import { CycleData, CyclePhase, CyclePredictions, DailyLog } from '../../types/cycle';

export const formatDate = (value?: string | null, pattern = 'MMM d') => {
  if (!value) {
    return '--';
  }
  return format(parseISO(value), pattern);
};

export const getCycleDay = (cycle: CycleData | null, date = new Date()) => {
  if (!cycle?.startDate) {
    return null;
  }
  return Math.max(1, differenceInDays(date, parseISO(cycle.startDate)) + 1);
};

export const getPhase = (cycle: CycleData | null, date = new Date()): CyclePhase | 'unknown' => {
  const cycleDay = getCycleDay(cycle, date);
  if (!cycleDay || !cycle) {
    return 'unknown';
  }

  if (cycleDay <= cycle.periodLength) {
    return 'menstrual';
  }
  if (cycleDay >= 12 && cycleDay <= 16) {
    return 'ovulation';
  }
  if (cycleDay < 12) {
    return 'follicular';
  }
  return 'luteal';
};

export const phaseCopy: Record<CyclePhase | 'unknown', { label: string; tone: string; description: string }> = {
  menstrual: {
    label: 'Menstrual',
    tone: 'bg-soft-peach text-danger',
    description: 'Logged bleeding days are treated as facts. Predictions stay clearly marked.',
  },
  follicular: {
    label: 'Follicular',
    tone: 'bg-soft-cyan text-clinical-blue',
    description: 'Energy and symptoms can shift as your body moves toward ovulation.',
  },
  ovulation: {
    label: 'Ovulation window',
    tone: 'bg-soft-lemon text-sunrise',
    description: 'This is an estimate, not a contraceptive or diagnostic signal.',
  },
  luteal: {
    label: 'Luteal',
    tone: 'bg-soft-lilac text-deep-indigo',
    description: 'Track sleep, mood, appetite, and symptoms to spot repeat patterns.',
  },
  unknown: {
    label: 'Not enough data',
    tone: 'bg-mist text-muted',
    description: 'Add a recent period start to build a cycle timeline.',
  },
};

export const isPredictedPeriodDay = (date: Date, predictions: CyclePredictions | null) => {
  if (!predictions?.nextPeriod) {
    return false;
  }
  const start = parseISO(predictions.nextPeriod);
  return isWithinInterval(date, { start, end: addDays(start, 4) });
};

export const isPredictedFertileDay = (date: Date, predictions: CyclePredictions | null) => {
  if (!predictions?.fertileWindowStart || !predictions?.fertileWindowEnd) {
    return false;
  }
  return isWithinInterval(date, {
    start: parseISO(predictions.fertileWindowStart),
    end: parseISO(predictions.fertileWindowEnd),
  });
};

export const logsForDate = (logs: DailyLog[], date: Date) => {
  const dayKey = format(date, 'yyyy-MM-dd');
  return logs.filter((log) => log.date === dayKey);
};

export const latestLogs = (logs: DailyLog[], count = 4) =>
  [...logs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
