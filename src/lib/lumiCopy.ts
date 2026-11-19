import type { AppState, LumiMood } from '../types/domain';

export function formatHeartCountdown(seconds: number | null): string {
  if (seconds === null) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function getLumiCompanionMessage(
  state: Pick<
    AppState,
    'hearts' | 'streakDays' | 'totalTasksSolved' | 'activeSession' | 'taskSessionPaused'
  >,
  dailyGoalPercent: number
): { mood: LumiMood; message: string } {
  if (state.hearts <= 0) {
    return {
      mood: 'supportive',
      message: 'Zero serc? Poczytaj teorię albo odzyskaj +1 serce w Misji Ratunkowej.',
    };
  }
  if (dailyGoalPercent >= 100) {
    return {
      mood: 'celebrate',
      message: 'Cel na dziś zaliczony! Świetna robota przed E8.',
    };
  }
  if (state.activeSession && state.taskSessionPaused) {
    return {
      mood: 'happy',
      message: 'Twoja lekcja jest zapisana — dokończymy ją razem?',
    };
  }
  if (state.streakDays >= 3) {
    return {
      mood: 'happy',
      message: `Seria ${state.streakDays} dni z rzędu! Trzymaj to tempo.`,
    };
  }
  if (state.totalTasksSolved > 0) {
    return {
      mood: 'happy',
      message: 'Krótka runda 5 minut dziennie buduje pewność na egzaminie.',
    };
  }
  return {
    mood: 'idle',
    message: 'Zacznij od pierwszej lekcji — krok po kroku ogarniemy E8!',
  };
}
