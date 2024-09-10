import { name } from '@mono/utils/readFile'
import { describe, expect, expectTypeOf, it } from 'vitest'

describe('readFile.browser', () => {
  it('name', () => {
    expect(name).toBe('readFile.browser')
    expectTypeOf(name).toEqualTypeOf<'readFile.browser'>()
    expectTypeOf(name).not.toEqualTypeOf<'readFile.node'>()
  })
})
