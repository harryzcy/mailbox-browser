import { describe, expect, it } from 'vitest'

import { featureFlags, isFeatureEnabledFor } from 'services/featureFlags'

describe('featureFlags', () => {
  it('should gate preloadEmail on the Mailbox version', () => {
    expect(featureFlags.preloadEmail).toEqual({
      enabled: true,
      minMailboxVersion: '2.2.0'
    })
  })
})

describe('isFeatureEnabledFor', () => {
  it('should be true at or above the required version', () => {
    expect(isFeatureEnabledFor('preloadEmail', 'v2.2.0')).toBe(true)
    expect(isFeatureEnabledFor('preloadEmail', 'v2.2.1')).toBe(true)
    expect(isFeatureEnabledFor('preloadEmail', 'v2.3.0')).toBe(true)
  })

  it('should be false below the required version', () => {
    expect(isFeatureEnabledFor('preloadEmail', 'v2.1.0')).toBe(false)
    expect(isFeatureEnabledFor('preloadEmail', 'v2.2.0-rc.1')).toBe(false)
  })

  it('should fail closed on an unknown version', () => {
    const missing: string | undefined = undefined
    expect(isFeatureEnabledFor('preloadEmail', missing)).toBe(false)
    expect(isFeatureEnabledFor('preloadEmail', 'dev')).toBe(false)
  })
})
