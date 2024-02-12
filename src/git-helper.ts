import * as io from '@actions/io'
import {exec} from '@actions/exec'

const execute = async (args: string[]): Promise<string> => {
  const executable = await io.which('git', true)
  const stdout: string[] = []
  const listeners = {
    stdout: (data: Buffer) => {
      stdout.push(data.toString())
    }
  }
  const options = {
    listeners
  }
  await exec(executable, args, options)
  return stdout.join('')
}

const getDefaultBranch = async (repositoryUrl: string): Promise<string> => {
  const output = await execute(['ls-remote', '--quiet', '--exit-code', '--symref', repositoryUrl, 'HEAD'])

  for (let line of output.trim().split('\n')) {
    line = line.trim()
    if (line.startsWith('ref:') || line.endsWith('HEAD')) {
      const matches = line.match(/refs\/heads\/([^/]+)\s+HEAD$/)
      if (matches && matches.length > 1) return matches[1].trim()
    }
  }

  throw new Error('Unexpected output when retrieving default branch')
}

const getDiff = async (base: string, head: string, ...args: string[]): Promise<string> =>
  await execute(['diff', ...args, base, head])

const getStatus = async (...args: string[]): Promise<string> => await execute(['status', ...args])

export const git = {
  getDefaultBranch,
  getDiff,
  getStatus
}
