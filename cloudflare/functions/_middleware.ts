import { Env } from '../src/config'

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

  const auth = await basicAuthentication(context.request)
  if (auth === null) {
    return newLoginPrompt()
  }
  const { user, pass } = auth
  if (
    user !== context.env.AUTH_BASIC_USER ||
    pass !== context.env.AUTH_BASIC_PASS
  ) {
    return newLoginPrompt()
  }

  return await context.next()
}

const basicAuthentication = async (request: Request) => {
  const authorization = request.headers.get('Authorization')

  const [scheme, encoded] = authorization.split(' ')

  if (!encoded || scheme !== 'Basic') {
    return null
  }

  const buffer = Uint8Array.from(atob(encoded), (character) =>
    character.charCodeAt(0)
  )
  const decoded = new TextDecoder().decode(buffer).normalize()
  const index = decoded.indexOf(':')
  if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
    return null
  }

  return {
    user: decoded.substring(0, index),
    pass: decoded.substring(index + 1)
  }
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
