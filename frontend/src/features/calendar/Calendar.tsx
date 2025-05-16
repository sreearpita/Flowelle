import React, { useEffect, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addDays,
  isWithinInterval,
  differenceInDays,
} from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  getCurrentCycle,
  getPredictions,
  logSymptom,
} from '../../store/slices/cycleSlice';

interface SymptomFormData {
  type: string;
  severity: number;
  notes: string;
}

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [symptomForm, setSymptomForm] = useState<SymptomFormData>({
    type: 'cramps',
    severity: 1,
    notes: '',
  });

  const dispatch = useAppDispatch();
  const { currentCycle, predictions, isLoading, error } = useAppSelector((state) => state.cycle);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(getCurrentCycle());
      dispatch(getPredictions());
    }
  }, [dispatch, user?.id]);

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getCyclePhase = (date: Date) => {
    if (!currentCycle || !predictions) return 'normal';

    const periodStart = new Date(currentCycle.startDate);
    const periodEnd = addDays(periodStart, currentCycle.periodLength - 1);
    const ovulationDay = addDays(periodStart, 14);
    const fertileStart = addDays(ovulationDay, -5);
    const fertileEnd = addDays(ovulationDay, 1);

    if (isWithinInterval(date, { start: periodStart, end: periodEnd })) {
      return 'period';
    }
    if (isWithinInterval(date, { start: fertileStart, end: fertileEnd })) {
      return 'fertile';
    }
    if (isSameDay(date, ovulationDay)) {
      return 'ovulation';
    }
    return 'normal';
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'period':
        return 'bg-rose-quartz';
      case 'fertile':
        return 'bg-sage-green bg-opacity-50';
      case 'ovulation':
        return 'bg-sage-green';
      default:
        return 'bg-white';
    }
  };

  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCycle?.id) {
      console.error('No active cycle found');
      return;
    }
    try {
      await dispatch(logSymptom({
        cycleId: currentCycle.id,
        date: selectedDate.toISOString().split('T')[0],
        ...symptomForm,
      })).unwrap();
      setShowSymptomModal(false);
      setSymptomForm({ type: 'cramps', severity: 1, notes: '' });
    } catch (error) {
      console.error('Failed to log symptom:', error);
    }
  };

  const handleSymptomChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSymptomForm((prev) => ({
      ...prev,
      [name]: name === 'severity' ? parseInt(value, 10) : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-quartz"></div>
      </div>
    );
  }

  const days = getDaysInMonth(selectedDate);

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {!user?.id ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Please log in to view your calendar.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600">
                {day}
              </div>
            ))}
            {days.map((day) => {
              const phase = getCyclePhase(day);
              return (
                <button
                  key={day.toString()}
                  onClick={() => {
                    setSelectedDate(day);
                    setShowSymptomModal(true);
                  }}
                  className={`
                    p-4 rounded-lg border ${getPhaseColor(phase)}
                    hover:border-rose-quartz focus:outline-none focus:ring-2 focus:ring-rose-quartz
                  `}
                >
                  <div className="text-center">
                    <span className="text-lg">{format(day, 'd')}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {predictions && (
            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-semibold text-deep-indigo">Upcoming Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-rose-quartz bg-opacity-20 rounded-lg">
                  <p className="font-medium">Next Period</p>
                  <p>{format(new Date(predictions.nextPeriod), 'MMM d, yyyy')}</p>
                  <p className="text-sm text-gray-600">
                    in {differenceInDays(new Date(predictions.nextPeriod), new Date())} days
                  </p>
                </div>
                <div className="p-4 bg-sage-green bg-opacity-20 rounded-lg">
                  <p className="font-medium">Fertile Window</p>
                  <p>
                    {format(new Date(predictions.fertileWindowStart), 'MMM d')} -{' '}
                    {format(new Date(predictions.fertileWindowEnd), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="p-4 bg-sage-green bg-opacity-20 rounded-lg">
                  <p className="font-medium">Ovulation Day</p>
                  <p>{format(new Date(predictions.ovulationDay), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showSymptomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              Log Symptom for {format(selectedDate, 'MMM d, yyyy')}
            </h3>
            <form onSubmit={handleSymptomSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="type"
                  value={symptomForm.type}
                  onChange={handleSymptomChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-quartz focus:ring-rose-quartz"
                >
                  <option value="cramps">Cramps</option>
                  <option value="headache">Headache</option>
                  <option value="mood">Mood Changes</option>
                  <option value="fatigue">Fatigue</option>
                  <option value="bloating">Bloating</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Severity (1-5)</label>
                <input
                  type="number"
                  name="severity"
                  min="1"
                  max="5"
                  value={symptomForm.severity}
                  onChange={handleSymptomChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-quartz focus:ring-rose-quartz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={symptomForm.notes}
                  onChange={handleSymptomChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-quartz focus:ring-rose-quartz"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSymptomModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-quartz rounded-md hover:bg-opacity-90"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar; 