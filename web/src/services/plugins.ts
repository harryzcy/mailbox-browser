import { Email } from './emails'

export interface Plugin {
  name: string
  displayName: string
  endpoints: {
    email: string
    emails: string
  }
}

async function callPluginsHook(
  plugin: Plugin,
  action: 'email' | 'emails',
  data: Email | Email[]
) {
  const url = plugin.endpoints[action]
  await fetch(url, { method: 'POST' })
}
