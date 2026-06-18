import { strict as assert } from 'node:assert'
import test from 'node:test'
import {
  dateKeyFromTimestamp,
  dayRange,
  daysElapsedInMonth,
  formatRelativeDayReference,
  monthKeyFromTimestamp,
} from '../convex/dates.ts'

const COLOMBIA_TZ_OFFSET_MINUTES = 300

test('buckets timestamps by device-local day around Colombia midnight', () => {
  assert.equal(
    dateKeyFromTimestamp(
      Date.parse('2026-06-18T00:30:00.000Z'),
      COLOMBIA_TZ_OFFSET_MINUTES
    ),
    '2026-06-17'
  )
  assert.equal(
    dateKeyFromTimestamp(
      Date.parse('2026-06-18T05:00:00.000Z'),
      COLOMBIA_TZ_OFFSET_MINUTES
    ),
    '2026-06-18'
  )
})

test('builds local day ranges from the same timezone contract', () => {
  assert.deepEqual(dayRange('2026-06-18', COLOMBIA_TZ_OFFSET_MINUTES), {
    start: Date.parse('2026-06-18T05:00:00.000Z'),
    end: Date.parse('2026-06-19T05:00:00.000Z'),
  })
})

test('derives month and elapsed days without server timezone', () => {
  assert.equal(
    monthKeyFromTimestamp(
      Date.parse('2026-07-01T02:00:00.000Z'),
      COLOMBIA_TZ_OFFSET_MINUTES
    ),
    '2026-06'
  )
  assert.equal(daysElapsedInMonth('2026-06', '2026-06-18'), 18)
  assert.equal(daysElapsedInMonth('2026-05', '2026-06-18'), 31)
})

test('formats insight day references from date keys', () => {
  assert.equal(formatRelativeDayReference('2026-06-18', '2026-06-18'), 'hoy')
  assert.equal(formatRelativeDayReference('2026-06-17', '2026-06-18'), 'ayer')
  assert.equal(formatRelativeDayReference('2026-06-15', '2026-06-18'), 'el lunes 15')
})
