import { test, expect } from 'claude-code/testing'

import { barra } from './register'

test('barra preenche proporcionalmente', () => {
  expect(barra(0)).toBe('░'.repeat(8))
  expect(barra(50)).toBe('█'.repeat(4) + '░'.repeat(4))
  expect(barra(100)).toBe('█'.repeat(8))
  expect(barra(null)).toBe('░'.repeat(8))
})
