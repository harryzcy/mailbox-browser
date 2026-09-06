export interface ParsedVersion {
  major: number
  minor: number
  patch: number
  // A pre-release such as `rc.1`, which sorts before the release.
  prerelease: string | null
  // Commits past the tag, from a `-40-gf789eb67` suffix.
  commitsAhead: number
}

// Handles `v2.2.0`, pre-releases, and `git describe` output. Null if unparseable.
export function parseVersion(raw: string): ParsedVersion | null {
  let rest = raw.trim().replace(/^v/u, '')

  let commitsAhead = 0
  const described = /^(.*)-(\d+)-g[0-9a-f]{7,}$/u.exec(rest)
  if (described) {
    rest = described[1]
    commitsAhead = Number(described[2])
  }

  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/u.exec(rest)
  if (!match) {
    return null
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
    commitsAhead
  }
}

// Returns -1, 0 or 1, or null when either side can't be parsed.
export function compareVersions(a: string, b: string): number | null {
  const left = parseVersion(a)
  const right = parseVersion(b)
  if (!left || !right) {
    return null
  }

  for (const part of ['major', 'minor', 'patch'] as const) {
    if (left[part] !== right[part]) {
      return left[part] < right[part] ? -1 : 1
    }
  }

  // A pre-release sorts before the release it leads up to.
  if (left.prerelease !== right.prerelease) {
    if (left.prerelease === null) return 1
    if (right.prerelease === null) return -1
    return left.prerelease < right.prerelease ? -1 : 1
  }

  if (left.commitsAhead !== right.commitsAhead) {
    return left.commitsAhead < right.commitsAhead ? -1 : 1
  }
  return 0
}

// `floor` or newer. Unparseable versions fail closed.
export function isVersionAtLeast(version: string, floor: string): boolean {
  const result = compareVersions(version, floor)
  return result !== null && result >= 0
}
