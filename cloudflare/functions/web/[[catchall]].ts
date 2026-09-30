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
    method: context.request.method
  } as RequestInit
  if (context.request.headers.get('Content-Type') === 'application/json') {
    // aws4fetch can only sign a buffered body, not a stream
    data.body = await context.request.arrayBuffer()
    // without it, API Gateway treats the body as binary and base64-encodes it
    data.headers = { 'Content-Type': 'application/json' }
  }

  const res = await aws.fetch(`${endpoint}/${path}${query}`, data)
  return res
}
