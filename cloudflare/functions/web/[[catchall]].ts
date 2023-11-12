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

  const data = {
    method: context.request.method,
    headers: context.request.headers
  } as RequestInit
  if (
    context.request.method === 'PUT' ||
    (context.request.method === 'POST' &&
      context.request.headers.get('Content-Type') === 'application/json')
  ) {
    data.body = context.request.body
  }

  const res = await aws.fetch(`${endpoint}/${path}${query}`, data)
  return res
}
