import fs from 'node:fs'
import path from 'node:path'

import { defineWorkspace } from 'vitest/config'

import tsconfig from './tsconfig.json'

const { references } = tsconfig
interface TSConfig {
  include?: string[]
  exclude?: string[]
  compilerOptions?: {
    customConditions?: string[]
  }
}
const referenceProjects: [path: string, TSConfig][] = []
for (const { path: p } of references) {
  const projectTSConfigStr = fs.readFileSync(p, 'utf-8')
  const relativePath = path.relative(process.cwd(), p)

  // TODO support jsonc
  const projectTSConfig = JSON.parse(projectTSConfigStr) as TSConfig
  projectTSConfig.include = projectTSConfig.include
    ?.map(i => path.resolve(path.dirname(relativePath), i))
    ?.map(i => i.replace(new RegExp(`^${process.cwd()}${path.sep}`), ''))
  projectTSConfig.exclude = projectTSConfig.exclude
    ?.map(i => path.resolve(path.dirname(relativePath), i))
    ?.map(i => i.replace(new RegExp(`^${process.cwd()}${path.sep}`), ''))
  referenceProjects.push([p, projectTSConfig])
}

export default defineWorkspace(referenceProjects.map(([path, tsconfig]) => ({
  test: {
    include: tsconfig.include
  },
  ssr: {
    target: tsconfig.compilerOptions?.customConditions?.includes('browser')
      ? 'webworker'
      : 'node'
  },
  plugins: [
    {
      name: 'anonymous:overrideConditions',
      config: c => {
        if (!c.resolve) {
          c.resolve = {}
        }
        if (!c.resolve.conditions) {
          c.resolve.conditions = []
        }
        c.resolve.conditions = tsconfig.compilerOptions?.customConditions ?? ['default']
      },
    }
  ]
})))
