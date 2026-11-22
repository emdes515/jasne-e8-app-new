import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_TASKS_BY_ID } from '../data/mathExamMock';
import { getRescueTaskIds } from './rescueMission';
import type { MistakeBankEntry, SavedTaskEntry } from '../types/domain';

test('Misja pomija duplikaty, usunięte zadania i zadania zaliczone na poczet bieżącej misji', () => {
  const [counted, next, fallback] = Object.keys(ALL_TASKS_BY_ID);
  const save = (taskId: string): SavedTaskEntry => ({ key: taskId, taskId, subjectId: 'math', savedAt: 0 });
  const mistake = (taskId: string): MistakeBankEntry => ({
    key: taskId,
    taskId,
    subjectId: 'math',
    lastMistakeAt: 0,
    correctStreak: 0,
  });
  const state = {
    savedTasks: [save(fallback), save(next), save('usunięte'), save('toString')],
    mistakeBank: [mistake(counted), mistake(next)],
    rescueMissionCountedTaskIds: [counted],
  };
  assert.deepEqual(getRescueTaskIds(state), [next, fallback]);
  assert.deepEqual(getRescueTaskIds(state, 'polish'), []);
});