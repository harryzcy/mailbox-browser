export interface Config {
  emailAddresses: string[]
  disableProxy: boolean
  imagesAutoLoad: boolean
  plugins: Plugin[]
}

export interface Plugin {
  name: string
  displayName: string
  endpoints: {
    email: string
    emails: string
  }
}

export async function getConfig(): Promise<Config> {
  const response = await fetch('/config')
  return response.json() as Promise<Config>
}
