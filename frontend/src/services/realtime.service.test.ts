import { describe, expect, it } from 'vitest';
import {
  parseRealtimePeriodToolEvent,
  parseRealtimeToolEvent,
  parseRealtimeTranscriptEvent,
} from './realtime.service';

describe('parseRealtimeToolEvent', () => {
  it('creates a review from function call arguments', () => {
    const review = parseRealtimeToolEvent({
      type: 'response.function_call_arguments.done',
      name: 'prepare_symptom_log',
      arguments: JSON.stringify({
        date: '2026-05-13',
        symptoms: [
          { type: 'cramps', severity: 4, notes: 'evening' },
          { type: 'fatigue', severity: '2' },
        ],
      }),
    });

    expect(review).toEqual({
      date: '2026-05-13',
      symptoms: [
        { type: 'cramps', severity: 4, notes: 'evening' },
        { type: 'fatigue', severity: 2 },
      ],
    });
  });

  it('ignores unsupported symptom types and clamps severity', () => {
    const review = parseRealtimeToolEvent({
      type: 'response.function_call_arguments.done',
      name: 'prepare_symptom_log',
      arguments: {
        date: '2026-05-13',
        symptoms: [
          { type: 'unknown', severity: 4 },
          { type: 'brain fog', severity: 9 },
        ],
      },
    });

    expect(review).toEqual({
      date: '2026-05-13',
      symptoms: [{ type: 'brain_fog', severity: 5 }],
    });
  });
});

describe('parseRealtimeTranscriptEvent', () => {
  it('reads incremental transcript deltas', () => {
    expect(
      parseRealtimeTranscriptEvent({
        type: 'conversation.item.input_audio_transcription.delta',
        item_id: 'item-1',
        delta: 'I had cramps',
      })
    ).toEqual({
      itemId: 'item-1',
      text: 'I had cramps',
      isFinal: false,
    });
  });

  it('reads completed transcript text', () => {
    expect(
      parseRealtimeTranscriptEvent({
        type: 'conversation.item.input_audio_transcription.completed',
        item_id: 'item-1',
        transcript: 'I had cramps today.',
      })
    ).toEqual({
      itemId: 'item-1',
      text: 'I had cramps today.',
      isFinal: true,
    });
  });
});

describe('parseRealtimePeriodToolEvent', () => {
  it('creates a period review from function call arguments', () => {
    const review = parseRealtimePeriodToolEvent({
      type: 'response.function_call_arguments.done',
      name: 'prepare_period_log',
      arguments: JSON.stringify({
        startDate: '2026-05-12',
        flow: 'heavy',
        notes: 'bad cramps in the evening',
      }),
    });

    expect(review).toEqual({
      startDate: '2026-05-12',
      flow: 'heavy',
      notes: 'bad cramps in the evening',
    });
  });

  it('ignores unsupported period flow values', () => {
    const review = parseRealtimePeriodToolEvent({
      type: 'response.function_call_arguments.done',
      name: 'prepare_period_log',
      arguments: {
        startDate: '2026-05-12',
        flow: 'extreme',
      },
    });

    expect(review).toEqual({
      startDate: '2026-05-12',
    });
  });
});
