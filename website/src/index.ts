import { foo } from '@mono/utils'
import { bar } from '@mono/utils/bar'
import { name } from '@mono/utils/readFile'
//       ^?

import '#~/main.ts'

// eslint-disable-next-line no-console
console.log(name)
// eslint-disable-next-line no-console
console.log(foo(), bar())
