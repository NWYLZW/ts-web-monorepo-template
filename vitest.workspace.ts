import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { defineWorkspace } from 'vitest/config'

import tsconfig from './tsconfig.json'

const relativeCWD = (p: string) => path.relative(process.cwd(), p)

const isTestFileGlobExpr = (expr: string) => expr.includes('.spec.')

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
  const filterSpecFiles = (globs: string[] = []) => globs
    .map(relativeCWD)
    .filter(isTestFileGlobExpr)

  // TODO support jsonc
  const projectTSConfig = JSON.parse(projectTSConfigStr) as TSConfig
  projectTSConfig.include = filterSpecFiles(projectTSConfig.include?.map(i => path.resolve(dirPath, i)))
  projectTSConfig.exclude = filterSpecFiles(projectTSConfig.exclude?.map(i => path.resolve(dirPath, i)))
  if (projectTSConfig.include.length !== 0 && projectTSConfig.exclude.length !== 0) {
    referenceProjects.push([p, projectTSConfig])
  }
}

export default defineWorkspace(referenceProjects.map(([, {
  include,
  compilerOptions
}]) => ({
  test: { include },
  ssr: {
    target: compilerOptions?.customConditions?.includes('browser')
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
        c.resolve.conditions = compilerOptions?.customConditions ?? ['default']
      },
    }
  ]
})))
