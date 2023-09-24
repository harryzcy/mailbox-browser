import { Plugin } from './config'

export const parsePlugins = (plugins: string): Plugin[] => {
  return JSON.parse(plugins)
}
