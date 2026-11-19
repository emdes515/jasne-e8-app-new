import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyMathKeyAction,
  applySmartBackspace,
  insertMathOperator,
  insertRawText,
  insertStepTemplate,
  insertUnit,
  moveCaret,
  wrapOrInsertPair,
} from './mathEditor';
import { matchesMathResult } from './openWork';
import { evaluateOpenTaskDeterministic } from '../services/ai/aiTutorMock';
import { MATH_LESSON_1_1 } from '../data/mathLessonMock';
import { MATH_MINI_EXAM_TASKS } from '../data/mathExamMock';

test('insertRawText inserts inside text, replaces selections, and respects maxLength', () => {
  const inserted = insertRawText({ text: '√ = 7', start: 1, end: 1 }, '49');
  assert.equal(inserted.text, '√49 = 7');
  assert.equal(inserted.start, 3);
  assert.equal(inserted.end, 3);

  const replaced = insertRawText({ text: 'P = 25 cm²', start: 4, end: 6 }, '49');
  assert.equal(replaced.text, 'P = 49 cm²');
  assert.equal(replaced.start, 6);

  const capped = insertRawText({ text: '1234', start: 4, end: 4 }, '56', 5);
  assert.equal(capped.text, '1234');
  assert.equal(capped.start, 4);
});

test('insertMathOperator formats binary operators with single spaces and handles unary minus cleanly', () => {
  const mul = insertMathOperator({ text: '7', start: 1, end: 1 }, '·');
  assert.equal(mul.text, '7 · ');
  assert.equal(mul.start, 4);

  // Avoid doubling existing trailing space
  const noDoubleSpace = insertMathOperator({ text: '7 ', start: 2, end: 2 }, '=');
  assert.equal(noDoubleSpace.text, '7 = ');

  // Unary minus cases
  const unaryStart = insertMathOperator({ text: '', start: 0, end: 0 }, '−');
  assert.equal(unaryStart.text, '−');
  assert.equal(unaryStart.start, 1);

  const unaryAfterParen = insertMathOperator({ text: '(', start: 1, end: 1 }, '−');
  assert.equal(unaryAfterParen.text, '(−');

  const unaryAfterEq = insertMathOperator({ text: 'x = ', start: 4, end: 4 }, '−');
  assert.equal(unaryAfterEq.text, 'x = −');
  const signedNum = insertRawText(unaryAfterEq, '5');
  assert.equal(signedNum.text, 'x = −5');

  // Binary minus after operand gets single spaces
  const binarySub = insertMathOperator({ text: '50', start: 2, end: 2 }, '−');
  assert.equal(binarySub.text, '50 − ');
});

test('wrapOrInsertPair places caret inside empty pair and wraps non-empty selections', () => {
  const empty = wrapOrInsertPair({ text: '', start: 0, end: 0 }, '(', ')');
  assert.equal(empty.text, '()');
  assert.equal(empty.start, 1);
  assert.equal(empty.end, 1);

  const wrapped = wrapOrInsertPair({ text: '12 + 16', start: 0, end: 7 }, '(', ')');
  assert.equal(wrapped.text, '(12 + 16)');
  assert.equal(wrapped.start, 9);
  assert.equal(wrapped.end, 9);

  const absEmpty = wrapOrInsertPair({ text: 'x = ', start: 4, end: 4 }, '|', '|');
  assert.equal(absEmpty.text, 'x = ||');
  assert.equal(absEmpty.start, 5);
});

test('insertUnit adds leading space after digits/parens without duplicating spaces', () => {
  const afterDigit = insertUnit({ text: '49', start: 2, end: 2 }, 'cm²');
  assert.equal(afterDigit.text, '49 cm²');

  const alreadySpaced = insertUnit({ text: '49 ', start: 3, end: 3 }, 'cm²');
  assert.equal(alreadySpaced.text, '49 cm²');
});

test('insertStepTemplate stays on blank lines and inserts newline mid-line', () => {
  const onEmpty = insertStepTemplate({ text: '', start: 0, end: 0 }, 'Dane: ');
  assert.equal(onEmpty.text, 'Dane: ');

  const onNonEmpty = insertStepTemplate({ text: 'a = 7 cm', start: 8, end: 8 }, 'Odp.: ');
  assert.equal(onNonEmpty.text, 'a = 7 cm\nOdp.: ');
});

test('applySmartBackspace deletes selection, padded operators, empty pairs, and single chars', () => {
  const selDel = applySmartBackspace({ text: '10 + 20', start: 3, end: 7 });
  assert.equal(selDel.text, '10 ');
  assert.equal(selDel.start, 3);

  const opDel = applySmartBackspace({ text: '7 · ', start: 4, end: 4 });
  assert.equal(opDel.text, '7');
  assert.equal(opDel.start, 1);

  const eqDel = applySmartBackspace({ text: 'x = ', start: 4, end: 4 });
  assert.equal(eqDel.text, 'x');

  const pairDel = applySmartBackspace({ text: 'x = ()', start: 5, end: 5 });
  assert.equal(pairDel.text, 'x = ');
  assert.equal(pairDel.start, 4);

  const singleDel = applySmartBackspace({ text: '49', start: 2, end: 2 });
  assert.equal(singleDel.text, '4');

  const atZero = applySmartBackspace({ text: '49', start: 0, end: 0 });
  assert.equal(atZero.text, '49');
  assert.equal(atZero.start, 0);
});

test('moveCaret clamps bounds and collapses active selection toward direction', () => {
  const left = moveCaret({ text: 'abc', start: 0, end: 0 }, -1);
  assert.equal(left.start, 0);

  const right = moveCaret({ text: 'abc', start: 3, end: 3 }, 1);
  assert.equal(right.start, 3);

  const collapseLeft = moveCaret({ text: 'abc', start: 1, end: 3 }, -1);
  assert.equal(collapseLeft.start, 1);
  assert.equal(collapseLeft.end, 1);

  const collapseRight = moveCaret({ text: 'abc', start: 1, end: 3 }, 1);
  assert.equal(collapseRight.start, 3);
  assert.equal(collapseRight.end, 3);
});

test('Composed math keyboard solution scores 2/2 in evaluateOpenTaskDeterministic and matchesMathResult handles multi-minus', () => {
  let state = { text: '', start: 0, end: 0 };
  const steps = [
    { kind: 'step' as const, value: 'Dane: ' },
    { kind: 'raw' as const, value: 'P' },
    { kind: 'operator' as const, value: '=' },
    { kind: 'raw' as const, value: '49' },
    { kind: 'unit' as const, value: 'cm²' },
    { kind: 'raw' as const, value: ', V = 27' },
    { kind: 'unit' as const, value: 'cm³' },
    { kind: 'step' as const, value: 'Obliczenia: ' },
    { kind: 'raw' as const, value: '√49' },
    { kind: 'operator' as const, value: '=' },
    { kind: 'raw' as const, value: '7' },
    { kind: 'unit' as const, value: 'cm' },
    { kind: 'raw' as const, value: ', ∛27' },
    { kind: 'operator' as const, value: '=' },
    { kind: 'raw' as const, value: '3' },
    { kind: 'unit' as const, value: 'cm' },
    { kind: 'step' as const, value: 'Odp.: ' },
    { kind: 'raw' as const, value: 'Suma: 7' },
    { kind: 'operator' as const, value: '+' },
    { kind: 'raw' as const, value: '3' },
    { kind: 'operator' as const, value: '=' },
    { kind: 'raw' as const, value: '10' },
    { kind: 'unit' as const, value: 'cm' },
  ];

  for (const action of steps) {
    state = applyMathKeyAction(state, action);
  }

  assert.equal(
    state.text,
    'Dane: P = 49 cm², V = 27 cm³\nObliczenia: √49 = 7 cm, ∛27 = 3 cm\nOdp.: Suma: 7 + 3 = 10 cm'
  );

  const openTask = MATH_LESSON_1_1.tasks.find((t) => t.id === 'math_l1_t5');
  assert.ok(openTask?.rubric);
  const evalResult = evaluateOpenTaskDeterministic(state.text, openTask.rubric);
  assert.equal(evalResult.score, 2);
  assert.equal(evalResult.expectedResultFound, true);

  const examOpenTask = MATH_MINI_EXAM_TASKS.find((t) => t.id === 'math_exam_t5');
  assert.ok(examOpenTask?.rubric);
  const examAnswer =
    'Obliczenia: koszt 3 · 4,50 = 13,50 zł, razem 13,50 + 6,50 = 20 zł.\nOdp.: Reszta 50 − 20 = 30 zł.';
  const examEval = evaluateOpenTaskDeterministic(examAnswer, examOpenTask.rubric);
  assert.equal(examEval.score, 2);
  assert.equal(examEval.expectedResultFound, true);

  // Multiple unicode minuses normalize cleanly
  assert.equal(matchesMathResult('−3/−4', '0,75'), true);
  assert.equal(matchesMathResult('−5', '-5'), true);
});
