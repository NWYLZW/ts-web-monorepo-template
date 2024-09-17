import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

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
  const dirPath = path.dirname(relativePath)

  // TODO support jsonc
  const projectTSConfig = JSON.parse(projectTSConfigStr) as TSConfig
  projectTSConfig.include = projectTSConfig.include
    ?.map(i => path.resolve(dirPath, i))
    ?.map(i => i.replace(new RegExp(`^${process.cwd()}${path.sep}`), ''))
    ?.filter(i => i.includes('.spec.'))
    ?? []
  projectTSConfig.exclude = projectTSConfig.exclude
    ?.map(i => path.resolve(dirPath, i))
    ?.map(i => i.replace(new RegExp(`^${process.cwd()}${path.sep}`), ''))
    ?.filter(i => i.includes('.spec.'))
    ?? []
  if (projectTSConfig.include.length !== 0 && projectTSConfig.exclude.length !== 0) {
    referenceProjects.push([p, projectTSConfig])
  }
}

export default defineWorkspace(referenceProjects.map(([, tsconfig]) => ({
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
