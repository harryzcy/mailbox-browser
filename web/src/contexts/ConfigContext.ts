import { Dispatch, createContext } from 'react'

export interface Config {
  emailAddresses: string[]
  disableProxy: boolean
  plugins: Plugin[]
}

export interface Plugin {
  name: string
  displayName: string
  endpoints: {
    email: string
    emails: string
  }
}

export interface State {
  config: Config
  loaded: boolean
}

export type Action = { type: 'set'; config: Config }

export const initialConfigState: State = {
  config: {
    emailAddresses: [],
    disableProxy: false,
    plugins: []
  },
  loaded: false
}

export function configReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set':
      return { config: action.config, loaded: true }
    default:
      return state
  }
}

export const ConfigContext = createContext<{
  state: State
  dispatch: Dispatch<Action>
}>({
  state: initialConfigState,
  dispatch: () => null
})
