import fs from 'node:fs'

export function readFile() {
  return fs.readFileSync('file.txt', 'utf-8').toString()
}

export const name = 'readFile.node'
