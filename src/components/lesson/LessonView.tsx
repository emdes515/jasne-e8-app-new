'use client';

import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { MATH_LESSON_1_1 } from '../../data/mathLessonMock';
import { BentoTheoryTabs } from './BentoTheoryTabs';
import { TaskRunner } from './TaskRunner';
import { LessonSummaryModal } from './LessonSummaryModal';

export function LessonView() {
  const {
    lessonViewStage,
    setLessonViewStage,
    startLessonTasks,
    lastSessionSummary,
  } = useAppState();

  if (lessonViewStage === 'theory') {
    return (
      <BentoTheoryTabs
        lesson={MATH_LESSON_1_1}
        onClose={() => setLessonViewStage('none')}
        onStartTasks={() => {
          startLessonTasks();
        }}
      />
    );
  }

  if (lessonViewStage === 'tasks') {
    return <TaskRunner />;
  }

  if (lessonViewStage === 'summary' && lastSessionSummary) {
    return <LessonSummaryModal summary={lastSessionSummary} />;
  }

  return null;
}
