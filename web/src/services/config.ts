import { Plugin } from './plugins'

interface Config {
  emailAddresses: string[]
  disableProxy: boolean
  plugins: Plugin[]
}

export async function getConfig(): Promise<Config> {
  const response = await fetch('/config')
  return response.json()
}
