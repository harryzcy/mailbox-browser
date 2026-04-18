import useSWR from 'swr'

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

export function useConfig() {
  const { data, error, isLoading } = useSWR<Config, Error>(
    'config',
    async () => {
      const response = await fetch('/config')
      return response.json() as Promise<Config>
    }
  )

  return {
    config: data,
    isLoading,
    error
  }
}
