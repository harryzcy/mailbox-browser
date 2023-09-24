import { AwsClient } from 'aws4fetch'
import { Env } from '../../src/config'

export const onRequest: PagesFunction<Env> = async (context) => {
  const segments = context.params.catchall as string[]

  const aws = new AwsClient({
    accessKeyId: context.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: context.env.AWS_SECRET_ACCESS_KEY,
    service: 'execute-api',
    region: context.env.AWS_REGION
  })

  let endpoint = context.env.AWS_API_GATEWAY_ENDPOINT
  if (endpoint.endsWith('/')) {
    endpoint = endpoint.slice(0, -1)
  }
  const path = segments.join('/')
  const url = context.request.url
  const query = url.includes('?') ? `?${url.split('?')[1]}` : ''
  const headers = context.request.headers
  headers.append('Accept', 'application/json')
  if (context.request.method === 'POST' || context.request.method === 'PUT') {
    headers.append('Content-Type', 'application/json')
  }

  const res = await aws.fetch(`${endpoint}/${path}${query}`, {
    method: context.request.method,
    body: context.request.body
  })
  return res
}
