import { name } from '@mono/utils/readFile'
//       ^?
import type { Numbers, Strings } from '@mono/share'

// eslint-disable-next-line no-console
console.log(name)
// eslint-disable-next-line no-console
console.log('Hello, World!')

const num: Numbers = 123
// eslint-disable-next-line no-console
console.log(num)
const str: Strings = 'abc'
// eslint-disable-next-line no-console
console.log(str)
