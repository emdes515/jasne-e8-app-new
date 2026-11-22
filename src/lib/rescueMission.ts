import { ALL_TASKS_BY_ID } from '../data/mathExamMock';
import type { AppState, SubjectId } from '../types/domain';

export function getRescueTaskIds(
  state: Pick<AppState, 'mistakeBank' | 'savedTasks' | 'rescueMissionCountedTaskIds'>,
  subject: SubjectId | 'all' = 'all',
): string[] {
  const counted = new Set(state.rescueMissionCountedTaskIds);
  const eligible = [...state.mistakeBank, ...state.savedTasks].filter(
    ({ taskId, subjectId }) =>
      (subject === 'all' || subject === subjectId) &&
      Object.hasOwn(ALL_TASKS_BY_ID, taskId) &&
      !counted.has(taskId),
  );
  return [...new Set(eligible.map(({ taskId }) => taskId))];
}