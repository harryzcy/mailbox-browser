interface Config {
  emailAddresses: string[]
}

export async function getConfig(): Promise<Config> {
  const response = await fetch('/config')
  return response.json()
}
