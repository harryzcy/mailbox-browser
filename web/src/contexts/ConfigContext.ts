import { Dispatch, createContext } from 'react'

import { Config } from 'services/config'

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

export interface Action {
  type: 'set'
  config: Config
}

export const initialConfigState: State = {
  config: {
    emailAddresses: [],
    disableProxy: false,
    imagesAutoLoad: false,
    plugins: []
  },
  loaded: false
}

export function configReducer(state: State, action: Action): State {
  switch (action.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
