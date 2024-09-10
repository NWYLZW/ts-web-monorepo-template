import { foo } from '@mono/utils'
import { describe, expect, it } from 'vitest'

describe('mono utils', () => {
  it('foo', () => {
    expect(foo()).toBe('foo')
  })
})
