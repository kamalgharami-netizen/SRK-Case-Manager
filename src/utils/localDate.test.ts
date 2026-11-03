import test from 'node:test';
import assert from 'node:assert/strict';
import { getLocalDateInputValue } from './localDate';

test('formats the local calendar date as YYYY-MM-DD', () => {
  const date = new Date(2026, 10, 3, 0, 15);
  assert.equal(getLocalDateInputValue(date), '2026-11-03');
});

test('pads single-digit months and days', () => {
  const date = new Date(2026, 0, 5, 23, 45);
  assert.equal(getLocalDateInputValue(date), '2026-01-05');
});

test('does not shift a local date through UTC conversion', () => {
  const date = new Date(2026, 10, 3, 0, 5);
  assert.equal(getLocalDateInputValue(date), '2026-11-03');
});
