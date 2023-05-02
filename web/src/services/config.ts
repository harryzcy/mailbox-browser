interface Config {
  emailAddresses: string[]
  disableProxy: boolean
}

export async function getConfig(): Promise<Config> {
  const response = await fetch('/config')
  return response.json()
}
