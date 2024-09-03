import { name } from '@mono/utils/readFile'
import { describe, expect, expectTypeOf, test } from 'vitest'

describe('readFile.browser', function () {
  test('name', function () {
    expect(name).toBe('readFile.browser')
    expectTypeOf(name).toEqualTypeOf<'readFile.browser'>()
    expectTypeOf(name).not.toEqualTypeOf<'readFile.node'>()
  })
})
