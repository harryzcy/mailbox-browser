import { createContext, Dispatch } from 'react'

export interface Config {
  emailAddresses: string[]
}

export interface State {
  config: Config
  loaded: boolean
}

export type Action = { type: 'set'; config: Config }

export const initialConfigState: State = {
  config: {
    emailAddresses: []
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
