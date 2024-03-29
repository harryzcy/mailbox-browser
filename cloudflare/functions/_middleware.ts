import { Env } from '../src/config'

enum AuthState {
  Malformed = 0,
  NeedLogin,
  Authenticated
}

const allowedPaths = ['/info', '/ping', '/robots.txt']

export const onRequest: PagesFunction<Env> = async (context) => {
  const { pathname } = new URL(context.request.url)
  if (allowedPaths.includes(pathname)) {
    return await context.next()
  }

  if (context.env.AUTH_FORWARD_ADDRESS) {
    return await performForwardAuth(context)
  }

  if (context.env.AUTH_BASIC_USER && context.env.AUTH_BASIC_PASS) {
    return await performBasicAuth(context)
  }

  return await context.next()
}

const performForwardAuth: PagesFunction<Env> = async (context) => {
  const address = context.env.AUTH_FORWARD_ADDRESS

  const headers = context.request.headers

  const { protocol } = new URL(context.request.url)
  headers.set('X-Forwarded-Method', context.request.method)
  headers.set('X-Forwarded-Proto', protocol)
  headers.set('X-Forwarded-Host', headers.get('Host'))
  headers.set('X-Forwarded-URI', context.request.url)
  headers.set('X-Forwarded-For', headers.get('CF-Connecting-IP'))
  headers.set('X-Original-URL', context.request.url)

  console.log('headers', headers)

  const resp = await fetch(address, {
    headers,
    redirect: 'manual'
  })
  if (resp.status >= 200 && resp.status < 300) {
    console.log('authenticated')
    return await context.next()
  }

  console.log('not authenticated')
  return new Response(resp.body, {
    status: resp.status,
    headers: resp.headers
  })
}

const performBasicAuth: PagesFunction<Env> = async (context) => {
  const { protocol, pathname } = new URL(context.request.url)
  if (
    'https:' !== protocol ||
    'https' !== context.request.headers.get('x-forwarded-proto')
  ) {
    throw new Response('Please use a HTTPS connection.', { status: 400 })
  }

  if (pathname === '/logout') {
    // invalidate the "Authorization" header
    return new Response('Logged out.', { status: 401 })
  }

  const state = basicAuthentication(context.request, context.env)
  switch (state) {
    case AuthState.Malformed:
      return new Response('Malformed credentials.', { status: 400 })
    case AuthState.NeedLogin:
      return newLoginPrompt()
    case AuthState.Authenticated:
      break
    default:
      throw new Response('Unknown authentication state.', { status: 500 })
  }

  return await context.next()
}

const basicAuthentication = (request: Request, env: Env): AuthState => {
  const authorization = request.headers.get('Authorization')
  if (!authorization) {
    console.log('not authenticated, need login')
    return AuthState.NeedLogin
  }

  const [scheme, encoded] = authorization.split(' ')

  if (!encoded || scheme !== 'Basic') {
    console.log('malformed credentials')
    return AuthState.Malformed
  }

  const buffer = Uint8Array.from(atob(encoded), (character) =>
    character.charCodeAt(0)
  )
  const decoded = new TextDecoder().decode(buffer).normalize()
  const index = decoded.indexOf(':')
  if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
    return null
  }

  const user = decoded.substring(0, index)
  const pass = decoded.substring(index + 1)
  if (user !== env.AUTH_BASIC_USER || pass !== env.AUTH_BASIC_PASS) {
    console.log('not authenticated, need login')
    return AuthState.NeedLogin
  }
  console.log('authenticated')
  return AuthState.Authenticated
}

const newLoginPrompt = () => {
  return new Response('You need to login.', {
    status: 401,
    headers: {
      // Prompts the user for credentials.
      'WWW-Authenticate': 'Basic realm="my scope", charset="UTF-8"'
    }
  })
}
