import { describe, expect, it } from 'vitest'

import { compareVersions, isVersionAtLeast, parseVersion } from 'utils/version'

describe('parseVersion', () => {
  it('should parse a plain release, with or without the v prefix', () => {
    expect(parseVersion('v2.2.0')).toEqual({
      major: 2,
      minor: 2,
      patch: 0,
      prerelease: null,
      commitsAhead: 0
    })
    expect(parseVersion('2.2.0')).toEqual(parseVersion('v2.2.0'))
  })

  it('should parse a git describe suffix as commits past the tag', () => {
    expect(parseVersion('v0.16.4-40-gf789eb67')).toEqual({
      major: 0,
      minor: 16,
      patch: 4,
      prerelease: null,
      commitsAhead: 40
    })
  })

  it('should parse a pre-release', () => {
    expect(parseVersion('v2.3.0-rc.1')?.prerelease).toBe('rc.1')
  })

  it('should return null for untagged build placeholders', () => {
    expect(parseVersion('dev')).toBeNull()
    expect(parseVersion('n/a')).toBeNull()
    expect(parseVersion('')).toBeNull()
  })
})

describe('compareVersions', () => {
  it('should order by major, minor, then patch', () => {
    expect(compareVersions('2.2.0', '2.2.0')).toBe(0)
    expect(compareVersions('2.2.1', '2.2.0')).toBe(1)
    expect(compareVersions('2.3.0', '2.2.9')).toBe(1)
    expect(compareVersions('1.11.0', '2.0.0')).toBe(-1)
    expect(compareVersions('2.10.0', '2.9.0')).toBe(1)
  })

  it('should sort a pre-release before its release', () => {
    expect(compareVersions('2.2.0-rc.1', '2.2.0')).toBe(-1)
    expect(compareVersions('2.2.0', '2.2.0-rc.1')).toBe(1)
  })

  it('should sort commits past a tag after the tag', () => {
    expect(compareVersions('2.2.0-5-gabcdef1', '2.2.0')).toBe(1)
  })

  it('should return null when either side is unparseable', () => {
    expect(compareVersions('dev', '2.2.0')).toBeNull()
    expect(compareVersions('2.2.0', 'dev')).toBeNull()
  })
})

describe('isVersionAtLeast', () => {
  it('should be true at the floor and above', () => {
    expect(isVersionAtLeast('2.2.0', '2.2.0')).toBe(true)
    expect(isVersionAtLeast('v2.2.0', '2.2.0')).toBe(true)
    expect(isVersionAtLeast('v2.2.1', '2.2.0')).toBe(true)
    expect(isVersionAtLeast('v2.3.0', '2.2.0')).toBe(true)
    expect(isVersionAtLeast('v2.2.0-3-gabcdef1', '2.2.0')).toBe(true)
  })

  it('should be false below the floor', () => {
    expect(isVersionAtLeast('2.1.0', '2.2.0')).toBe(false)
    expect(isVersionAtLeast('v2.2.0-rc.1', '2.2.0')).toBe(false)
  })

  it('should fail closed on an unparseable version', () => {
    expect(isVersionAtLeast('dev', '2.2.0')).toBe(false)
  })
})
