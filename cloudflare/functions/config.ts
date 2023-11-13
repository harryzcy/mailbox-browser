import { Env } from '../src/config'

export const onRequest: PagesFunction<Env> = async (context) => {
  const proxyEnable = getBooleanWithDefault(context.env, 'PROXY_ENABLE', true)
  const imagesAutoLoad = getBooleanWithDefault(
    context.env,
    'IMAGES_AUTO_LOAD',
    true
  )

  return new Response(
    JSON.stringify({
      emailAddresses: context.env.EMAIL_ADDRESSES,
      disableProxy: !proxyEnable,
      imagesAutoLoad: imagesAutoLoad,
      plugins: [] // TODO: bring plugin support
    })
  )
}

function getBooleanWithDefault(
  env: Env,
  property: keyof Env,
  defaultValue: boolean
) {
  if (env[property] === undefined) {
    return defaultValue
  }
  return env[property] === 'true'
}
