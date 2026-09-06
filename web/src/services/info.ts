import useSWR, { preload } from 'swr'

export interface Info {
  build: string
  commit: string
  version: string
}

const INFO_KEY = 'info'

const infoFetcher = async (): Promise<Info> => {
  const response = await fetch('/web/info')
  return response.json() as Promise<Info>
}

export function useInfo() {
  const { data, error, isLoading } = useSWR<Info, Error>(INFO_KEY, infoFetcher)
  return { data, error, isLoading }
}

export function getInfo(): Promise<Info> {
  return Promise.resolve(preload<Info>(INFO_KEY, infoFetcher))
}
