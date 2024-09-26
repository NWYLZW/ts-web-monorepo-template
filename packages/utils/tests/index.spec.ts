import { foo } from '@mono/utils'
import { describe, expect, it } from 'vitest'
import { echoFooStr } from './echoFooStr'

describe('mono utils', () => {
  it('foo', () => {
    echoFooStr()
    expect(foo()).toBe('foo')
  })
})
