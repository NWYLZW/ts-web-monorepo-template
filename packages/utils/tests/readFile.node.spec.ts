import { name } from '@mono/utils/readFile'
import { describe, expect, expectTypeOf, test } from 'vitest'

describe('readFile.node', function () {
  test('name', function () {
    expect(name).toBe('readFile.node')
    expectTypeOf(name).toEqualTypeOf<'readFile.node'>()
    expectTypeOf(name).not.toEqualTypeOf<'readFile.browser'>()
  })
})
