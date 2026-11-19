'use client';

import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { findMathLesson } from '../../data/mathLessonMock';
import { BentoTheoryTabs } from './BentoTheoryTabs';
import { TaskRunner } from './TaskRunner';
import { LessonSummaryModal } from './LessonSummaryModal';

export function LessonView() {
  const {
    state,
    lessonViewStage,
    selectedLessonId,
    setLessonViewStage,
    startLessonTasks,
    lastSessionSummary,
  } = useAppState();

  if (lessonViewStage === 'theory') {
    const lesson = findMathLesson(selectedLessonId);
    if (!lesson) return null;
    return (
      <BentoTheoryTabs
        key={lesson.id}
        lesson={lesson}
        onClose={() => setLessonViewStage('none')}
        onStartTasks={() => {
          startLessonTasks(lesson.id);
        }}
      />
    );
  }

  if (lessonViewStage === 'tasks') {
    return <TaskRunner key={state.activeSession?.sessionId} />;
  }

  if (lessonViewStage === 'summary' && lastSessionSummary) {
    return <LessonSummaryModal summary={lastSessionSummary} />;
  }

  return null;
}
