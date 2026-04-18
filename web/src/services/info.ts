import useSWR from 'swr'

interface Info {
  build: string
  commit: string
  version: string
}

export function useInfo() {
  const { data, error, isLoading } = useSWR<Info, Error>('info', async () => {
    const response = await fetch('/web/info')
    return response.json() as Promise<Info>
  })
  return { data, error, isLoading }
}
