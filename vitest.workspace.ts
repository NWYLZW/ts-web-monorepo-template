import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { defineWorkspace } from 'vitest/config'

import tsconfig from './tsconfig.json'

const relativeCWD = (p: string) => `./${path.relative(process.cwd(), p)}`

const isTestFileGlobExpr = (expr: string) => expr.includes('.spec.')

const getCompilerOptions = (tsconfigPath: string): TSConfig => {
  const dirPath = path.dirname(tsconfigPath)
  const tsconfigStr = fs.readFileSync(tsconfigPath, 'utf-8')
  const tsconfig = JSON.parse(tsconfigStr) as TSConfig
  if (!tsconfig.extends || tsconfig.extends.length === 0) {
    return tsconfig
  }
  const extendPaths = Array.isArray(tsconfig.extends)
    ? tsconfig.extends
    : [tsconfig.extends]
  const extendCompilerOptions = extendPaths
    .map(p => {
      if (!path.isAbsolute(p)) {
        p = path.resolve(dirPath, p)
      }
      return getCompilerOptions(p).compilerOptions
    })
    .reduce((acc, curr = {}) => ({ ...acc, ...curr }), {} as TSConfig['compilerOptions'])
  return {
    ...tsconfig,
    compilerOptions: {
      ...extendCompilerOptions,
      ...tsconfig.compilerOptions
    }
  }
}

const { references } = tsconfig
interface TSConfig {
  extends?: string | string[]
  include?: string[]
  exclude?: string[]
  compilerOptions?: {
    customConditions?: string[]
  }
}
const referenceProjects: [path: string, TSConfig][] = []
for (const { path: p } of references) {
  const projectTSConfig = getCompilerOptions(p)

  const relativePath = path.relative(process.cwd(), p)
  const dirPath = path.dirname(relativePath)
  const filterSpecFiles = (globs: string[] = []) => globs
    .map(relativeCWD)
    .filter(isTestFileGlobExpr)

  projectTSConfig.include = filterSpecFiles(projectTSConfig.include?.map(i => path.resolve(dirPath, i)))
  projectTSConfig.exclude = filterSpecFiles(projectTSConfig.exclude?.map(i => path.resolve(dirPath, i))).length > 0
    ? projectTSConfig.exclude
      ?.map(i => path.resolve(dirPath, i))
      ?.map(relativeCWD)
    : []
  if (projectTSConfig.include?.length !== 0 || projectTSConfig.exclude?.length !== 0) {
    referenceProjects.push([p, projectTSConfig])
  }
}

export default defineWorkspace(referenceProjects.map(([, {
  include,
  exclude,
  compilerOptions
}]) => ({
  test: { include, exclude },
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
