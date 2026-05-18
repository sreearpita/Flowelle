import axios from 'axios';
import api from './api';

export type VoiceCheckInStatus = 'idle' | 'requesting-mic' | 'listening' | 'processing' | 'review' | 'error';

export type ExtractedVoiceSymptom = {
  type: string;
  severity: number;
  notes?: string;
};

export type VoiceSymptomReview = {
  date: string;
  symptoms: ExtractedVoiceSymptom[];
};

export type VoicePeriodFlow = 'light' | 'medium' | 'heavy' | 'spotting';

export type VoicePeriodReview = {
  startDate: string;
  flow?: VoicePeriodFlow;
  notes?: string;
};

type RealtimeSessionResponse = {
  session: {
    value?: string;
    client_secret?: string | { value?: string; secret?: string };
  };
};

type VoiceCheckInCallbacks<TReview> = {
  onStatusChange: (status: VoiceCheckInStatus) => void;
  onReview: (review: TReview) => void;
  onTranscriptChange?: (transcript: string) => void;
  onError: (message: string) => void;
};

export type VoiceCheckInConnection = {
  finish: () => void;
  stop: () => void;
};

const allowedSymptomTypes = new Set([
  'cramps',
  'headache',
  'fatigue',
  'bloating',
  'breast_tenderness',
  'mood_changes',
  'anxiety',
  'stress',
  'irritability',
  'brain_fog',
  'low_motivation',
]);

const allowedPeriodFlows = new Set(['light', 'medium', 'heavy', 'spotting']);

const clampSeverity = (severity: unknown): number => {
  const numeric = typeof severity === 'number' ? severity : Number(severity);
  if (!Number.isFinite(numeric)) {
    return 3;
  }
  return Math.min(5, Math.max(1, Math.round(numeric)));
};

const normalizeType = (type: unknown): string | null => {
  if (typeof type !== 'string') {
    return null;
  }

  const normalized = type.toLowerCase().trim().replace(/[\s-]+/g, '_');
  return allowedSymptomTypes.has(normalized) ? normalized : null;
};

const normalizeReview = (payload: unknown): VoiceSymptomReview | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = payload as { date?: unknown; symptoms?: unknown };
  if (typeof data.date !== 'string' || !Array.isArray(data.symptoms)) {
    return null;
  }

  const symptoms = data.symptoms
    .map((symptom) => {
      if (!symptom || typeof symptom !== 'object') {
        return null;
      }

      const item = symptom as { type?: unknown; severity?: unknown; notes?: unknown };
      const type = normalizeType(item.type);
      if (!type) {
        return null;
      }

      return {
        type,
        severity: clampSeverity(item.severity),
        notes: typeof item.notes === 'string' && item.notes.trim() ? item.notes.trim() : undefined,
      };
    })
    .filter((symptom): symptom is ExtractedVoiceSymptom => Boolean(symptom));

  if (symptoms.length === 0) {
    return null;
  }

  return {
    date: data.date,
    symptoms,
  };
};

const parseArguments = (value: unknown): VoiceSymptomReview | null => {
  if (typeof value === 'string') {
    try {
      return normalizeReview(JSON.parse(value));
    } catch {
      return null;
    }
  }

  return normalizeReview(value);
};

const normalizePeriodReview = (payload: unknown): VoicePeriodReview | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = payload as { startDate?: unknown; flow?: unknown; notes?: unknown };
  if (typeof data.startDate !== 'string' || !data.startDate.trim()) {
    return null;
  }

  const flow =
    typeof data.flow === 'string' && allowedPeriodFlows.has(data.flow.toLowerCase().trim())
      ? (data.flow.toLowerCase().trim() as VoicePeriodFlow)
      : undefined;

  return {
    startDate: data.startDate,
    flow,
    notes: typeof data.notes === 'string' && data.notes.trim() ? data.notes.trim() : undefined,
  };
};

const parsePeriodArguments = (value: unknown): VoicePeriodReview | null => {
  if (typeof value === 'string') {
    try {
      return normalizePeriodReview(JSON.parse(value));
    } catch {
      return null;
    }
  }

  return normalizePeriodReview(value);
};

export const parseRealtimeToolEvent = (event: unknown): VoiceSymptomReview | null => {
  if (!event || typeof event !== 'object') {
    return null;
  }

  const data = event as {
    type?: string;
    name?: string;
    arguments?: unknown;
    item?: { type?: string; name?: string; arguments?: unknown };
    response?: { output?: Array<{ type?: string; name?: string; arguments?: unknown }> };
  };

  if (data.type === 'response.function_call_arguments.done' && data.name === 'prepare_symptom_log') {
    return parseArguments(data.arguments);
  }

  if (data.item?.type === 'function_call' && data.item.name === 'prepare_symptom_log') {
    return parseArguments(data.item.arguments);
  }

  const outputItem = data.response?.output?.find(
    (item) => item.type === 'function_call' && item.name === 'prepare_symptom_log'
  );
  return outputItem ? parseArguments(outputItem.arguments) : null;
};

export const parseRealtimePeriodToolEvent = (event: unknown): VoicePeriodReview | null => {
  if (!event || typeof event !== 'object') {
    return null;
  }

  const data = event as {
    type?: string;
    name?: string;
    arguments?: unknown;
    item?: { type?: string; name?: string; arguments?: unknown };
    response?: { output?: Array<{ type?: string; name?: string; arguments?: unknown }> };
  };

  if (data.type === 'response.function_call_arguments.done' && data.name === 'prepare_period_log') {
    return parsePeriodArguments(data.arguments);
  }

  if (data.item?.type === 'function_call' && data.item.name === 'prepare_period_log') {
    return parsePeriodArguments(data.item.arguments);
  }

  const outputItem = data.response?.output?.find(
    (item) => item.type === 'function_call' && item.name === 'prepare_period_log'
  );
  return outputItem ? parsePeriodArguments(outputItem.arguments) : null;
};

export const parseRealtimeTranscriptEvent = (event: unknown): { itemId: string; text: string; isFinal: boolean } | null => {
  if (!event || typeof event !== 'object') {
    return null;
  }

  const data = event as { type?: string; item_id?: string; delta?: unknown; transcript?: unknown };
  if (data.type === 'conversation.item.input_audio_transcription.delta' && typeof data.delta === 'string') {
    return {
      itemId: data.item_id || 'current',
      text: data.delta,
      isFinal: false,
    };
  }

  if (
    data.type === 'conversation.item.input_audio_transcription.completed' &&
    typeof data.transcript === 'string'
  ) {
    return {
      itemId: data.item_id || 'current',
      text: data.transcript,
      isFinal: true,
    };
  }

  return null;
};

const getEphemeralKey = (response: RealtimeSessionResponse): string => {
  const secret = response.session?.client_secret;

  if (typeof response.session?.value === 'string') {
    return response.session.value;
  }

  if (typeof secret === 'string') {
    return secret;
  }

  if (typeof secret?.value === 'string') {
    return secret.value;
  }

  if (typeof secret?.secret === 'string') {
    return secret.secret;
  }

  throw new Error('Realtime session response did not include a client secret');
};

type RealtimeSessionRequest = {
  mode?: 'symptom' | 'period';
  currentDate?: string;
};

const createRealtimeSession = async (request: RealtimeSessionRequest = {}): Promise<string> => {
  try {
    const response = await api.post<RealtimeSessionResponse>('/ai/realtime/session', request);
    return getEphemeralKey(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        typeof error.response?.data?.error === 'string'
          ? error.response.data.error
          : 'Unable to create a Realtime session.';
      throw new Error(message);
    }

    throw error;
  }
};

type RealtimeExtractionOptions<TReview> = {
  mode: 'symptom' | 'period';
  currentDate?: string;
  parseReview: (event: unknown) => TReview | null;
  finishInstructions: string;
  errorLabel: string;
};

const startRealtimeExtraction = async <TReview>(
  callbacks: VoiceCheckInCallbacks<TReview>,
  options: RealtimeExtractionOptions<TReview>
): Promise<VoiceCheckInConnection> => {
  callbacks.onStatusChange('requesting-mic');

  const ephemeralKey = await createRealtimeSession({
    mode: options.mode,
    currentDate: options.currentDate,
  });
  const peerConnection = new RTCPeerConnection();
  const dataChannel = peerConnection.createDataChannel('oai-events');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  let closed = false;
  const transcriptByItem = new Map<string, string>();

  const updateTranscript = (itemId: string, text: string, isFinal: boolean) => {
    const current = transcriptByItem.get(itemId) || '';
    transcriptByItem.set(itemId, isFinal ? text : `${current}${text}`);
    callbacks.onTranscriptChange?.(
      Array.from(transcriptByItem.values())
        .map((value) => value.trim())
        .filter(Boolean)
        .join('\n')
    );
  };

  const cleanup = () => {
    if (closed) {
      return;
    }
    closed = true;
    stream.getTracks().forEach((track) => track.stop());
    dataChannel.close();
    peerConnection.close();
  };

  dataChannel.addEventListener('open', () => {
    callbacks.onStatusChange('listening');
  });

  dataChannel.addEventListener('message', (event) => {
    try {
      const realtimeEvent = JSON.parse(event.data);
      const transcript = parseRealtimeTranscriptEvent(realtimeEvent);
      if (transcript) {
        updateTranscript(transcript.itemId, transcript.text, transcript.isFinal);
      }

      const review = options.parseReview(realtimeEvent);
      if (review) {
        callbacks.onReview(review);
        callbacks.onStatusChange('review');
        cleanup();
      }
    } catch {
      callbacks.onError('Unable to read the voice check-in response.');
      callbacks.onStatusChange('error');
      cleanup();
    }
  });

  peerConnection.addEventListener('connectionstatechange', () => {
    if (peerConnection.connectionState === 'failed') {
      callbacks.onError(`${options.errorLabel} connection failed.`);
      callbacks.onStatusChange('error');
      cleanup();
    }
  });

  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
    method: 'POST',
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${ephemeralKey}`,
      'Content-Type': 'application/sdp',
    },
  });

  if (!sdpResponse.ok) {
    cleanup();
    throw new Error('Unable to connect to the Realtime API');
  }

  await peerConnection.setRemoteDescription({
    type: 'answer',
    sdp: await sdpResponse.text(),
  });

  return {
    finish: () => {
      callbacks.onStatusChange('processing');
      stream.getTracks().forEach((track) => track.stop());

      if (dataChannel.readyState === 'open') {
        dataChannel.send(
          JSON.stringify({
            type: 'response.create',
            response: {
              instructions:
                options.finishInstructions,
            },
          })
        );
      }
    },
    stop: cleanup,
  };
};

export const startVoiceCheckIn = async (
  callbacks: VoiceCheckInCallbacks<VoiceSymptomReview>
): Promise<VoiceCheckInConnection> =>
  startRealtimeExtraction(callbacks, {
    mode: 'symptom',
    parseReview: parseRealtimeToolEvent,
    finishInstructions:
      'Extract the spoken symptom check-in into prepare_symptom_log. Use today if no date was spoken.',
    errorLabel: 'Voice check-in',
  });

export const startPeriodVoiceLog = async (
  callbacks: VoiceCheckInCallbacks<VoicePeriodReview>,
  currentDate: string
): Promise<VoiceCheckInConnection> =>
  startRealtimeExtraction(callbacks, {
    mode: 'period',
    currentDate,
    parseReview: parseRealtimePeriodToolEvent,
    finishInstructions:
      'Extract the spoken period start entry into prepare_period_log. Use the provided current date to resolve relative dates.',
    errorLabel: 'Voice period log',
  });
