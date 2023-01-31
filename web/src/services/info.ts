interface Info {
  build: string
  commit: string
  version: string
}

export async function getInfo(): Promise<Info> {
  const response = await fetch('/web/info')
  return response.json()
}
