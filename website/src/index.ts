import { foo } from '@mono/utils'
import { bar } from '@mono/utils/bar'
import { name } from '@mono/utils/readFile'
//       ^?

console.log(name)

console.log(foo(), bar())

document.querySelector('#app')!.innerHTML = 'Hello, World!'
