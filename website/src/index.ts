import { foo } from '@mono/utils'
import { bar } from '@mono/utils/bar'
import { name } from '@mono/utils/readFile'
//       ^?
import type { Numbers, Strings } from '@mono/share'

import '#~/main.ts'

// eslint-disable-next-line no-console
console.log(name)
// eslint-disable-next-line no-console
console.log(foo(), bar())

const num: Numbers = 123
// eslint-disable-next-line no-console
console.log(num)
const str: Strings = 'abc'
// eslint-disable-next-line no-console
console.log(str)
