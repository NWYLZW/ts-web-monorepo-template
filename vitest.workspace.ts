import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import ts from 'typescript'
import { defineWorkspace } from 'vitest/config'

const isTestFileGlobExpr = (expr: string) => expr.includes('.spec.')

const tsconfigPath = ts.findConfigFile(process.cwd(), fs.existsSync)
if (!tsconfigPath) throw new Error('tsconfig.json not found')

const { config: tsconfig, error } = ts.readConfigFile(tsconfigPath, p => fs.readFileSync(p, 'utf-8'))
if (error) throw error

const { projectReferences } = ts.parseJsonConfigFileContent(tsconfig, ts.sys, path.dirname(tsconfigPath), {}, tsconfigPath)

const projects: {
  files: string[]
  options: ts.CompilerOptions
}[] = []
projectReferences?.forEach(({ path: p }) => {
  const { config: tsconfig, error } = ts.readConfigFile(p, p => fs.readFileSync(p, 'utf-8'))
  if (error) throw error
  const { options, fileNames, errors } = ts.parseJsonConfigFileContent(tsconfig, ts.sys, path.dirname(p), {}, p)
  if (errors.length > 0) {
    errors.forEach(e => console.warn(`[vitest] ${e.messageText}`))
  }
  if (fileNames.filter(isTestFileGlobExpr).length > 0) {
    projects.push({ files: fileNames, options })
  }
})

export default defineWorkspace(projects.map(({
  files,
  options
}) => ({
  test: { include: files },
  ssr: {
    target: options?.customConditions?.includes('browser')
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
        c.resolve.conditions = options?.customConditions ?? ['default']
      },
    }
  ]
})))
