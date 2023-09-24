import { AwsClient } from 'aws4fetch'
import { Env, Plugin } from '../../src/config'
import { parsePlugins } from '../../src/plugin'
import { Email } from '../../src/email'

interface InvokeRequest {
  Name: string
  MessageIDs: string[]
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const plugins = parsePlugins(context.env.PLUGINS)
  const req = await context.request.json<InvokeRequest>()

  const aws = new AwsClient({
    accessKeyId: context.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: context.env.AWS_SECRET_ACCESS_KEY,
    service: 'execute-api',
    region: context.env.AWS_REGION
  })
  let endpoint = context.env.AWS_API_GATEWAY_ENDPOINT

  const plugin = plugins.find((plugin) => plugin.Name === req.Name)

  const emails = await getEmails(aws, endpoint, req.MessageIDs)
  return await invokePlugin(plugin, emails)
}

const getEmails = async (
  aws: AwsClient,
  endpoint: string,
  emailIDs: string[]
): Promise<Email[]> => {
  const emails: Email[] = []
  for (const emailID of emailIDs) {
    const res = await aws.fetch(`${endpoint}/emails/${emailID}`, {
      method: 'GET'
    })
    emails.push(await res.json())
  }
  return emails
}

const invokePlugin = async (plugin: Plugin, emails: Email[]) => {
  if (emails.length === 0) {
    return
  }

  let url: string
  let body: string
  if (emails.length === 1) {
    url = plugin.Endpoints.Email
    body = JSON.stringify(emails[0])
  } else {
    url = plugin.Endpoints.Emails
    if (url === '') {
      throw new Error('batch email endpoint not found')
    }
    body = JSON.stringify(emails)
  }

  return fetch(url, {
    body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
