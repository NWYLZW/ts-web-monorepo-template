import { name } from '@mono/utils/readFile'
import { describe, expect, expectTypeOf, it } from 'vitest'

describe('readFile.node', () => {
  it('name', () => {
    expect(name).toBe('readFile.node')
    expectTypeOf(name).toEqualTypeOf<'readFile.node'>()
    expectTypeOf(name).not.toEqualTypeOf<'readFile.browser'>()
  })
})
