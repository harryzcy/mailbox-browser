import { getInfo } from 'services/info'

import { isVersionAtLeast } from 'utils/version'

export const featureFlags = {
  // Prefetch on hover. Needs harryzcy/mailbox#1221
  preloadEmail: { enabled: true, minMailboxVersion: '2.2.0' }
}

export type FeatureName = keyof typeof featureFlags

// An absent or unparseable Mailbox version fails closed.
export function isFeatureEnabledFor(
  name: FeatureName,
  mailboxVersion: string | undefined
): boolean {
  const { enabled, minMailboxVersion } = featureFlags[name]
  return (
    enabled &&
    mailboxVersion !== undefined &&
    isVersionAtLeast(mailboxVersion, minMailboxVersion)
  )
}

export async function isFeatureEnabled(name: FeatureName): Promise<boolean> {
  try {
    return isFeatureEnabledFor(name, (await getInfo()).version)
  } catch {
    return false
  }
}
