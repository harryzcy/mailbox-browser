import { Env } from '../src/config'

enum AuthState {
  Malformed = 0,
  NeedLogin,
  Authenticated
}

export const onRequest: PagesFunction<Env> = async (context) => {
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
    return AuthState.NeedLogin
  }

  const [scheme, encoded] = authorization.split(' ')

  if (!encoded || scheme !== 'Basic') {
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
    return AuthState.NeedLogin
  }
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
