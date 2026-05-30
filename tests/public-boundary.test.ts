import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('Review SDK package does not ship Castalia wallet auth implementation', () => {
  const declarations = readFileSync(new URL('../dist/index.d.ts', import.meta.url), 'utf8')
  const source = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8')

  assert.equal(declarations.includes('wallet-auth'), false)
  assert.equal(declarations.includes('CastaliaWallet'), false)
  assert.equal(source.includes('wallet-auth'), false)
  assert.equal(source.includes('CastaliaWallet'), false)
})
