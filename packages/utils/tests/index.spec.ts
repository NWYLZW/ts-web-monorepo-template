import { foo } from '@mono/utils'
import { describe, expect, test } from 'vitest'

describe('mono utils', function () {
  test('foo', function () {
    expect(foo()).toBe('foo')
  })
})
