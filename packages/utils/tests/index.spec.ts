import { foo } from '@mono/utils'
import { describe, expect, test, vi } from 'vitest'

function proxyFn(init = {}) {
  const fn = vi.fn()
  const cache: Record<string | symbol, any> = {}
  return new Proxy(init, {
    get(_, key) {
      if (['then', 'catch', 'finally'].includes(String(key)))
        return Promise.resolve(void 0)

      // @ts-ignore
      if (key in fn) return fn[key]
      if (!(key in cache))
        cache[key] = proxyFn(() => void 0)
      return cache[key]
    },
    apply: (_, __, args) => fn(...args),
    has: () => true
  })
}

describe('mono utils', function () {
  test('foo', async function () {
    vi.mock('@mono/utils', () => proxyFn())
    foo()
    expect(foo).toHaveBeenCalledTimes(1)
    expect(global.a).toBe(undefined)
  })
})
