export interface Env {
  AUTH_BASIC_USER: string
  AUTH_BASIC_PASS: string
  AUTH_FORWARD_ADDRESS: string

  AWS_REGION: string
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  AWS_API_ID: string
  AWS_API_GATEWAY_ENDPOINT: string

  EMAIL_ADDRESSES: string[]
  PROXY_ENABLE: boolean
  IMAGES_AUTO_LOAD: boolean

  PLUGINS: string
}

export interface Plugin {
  Name: string
  DisplayName: string
  Endpoints: Endpoint
}

export interface Endpoint {
  Email: string
  Emails: string
}
