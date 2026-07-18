/**
 * Platform stats, fetched at build time from the app's public stats endpoint —
 * the same source of truth the landing page derives its numbers from. Pages
 * interpolate these instead of hardcoding counts that rot.
 *
 * Build-time only (VitePress data loader): a stale number lives at most until
 * the next docs deploy, and a fetch failure degrades to the static fallback
 * rather than failing the build.
 */

export interface PlatformStats {
  /** Chains whose rates Lendwise standardizes (data coverage). */
  standardizedChains: number
  /** Chains with wallet execution support. */
  executionChains: number
  /** Active supply + borrow products. */
  lendingMarkets: number
  /** Distinct assets across active products. */
  assets: number
  generatedAt: string
}

const FALLBACK: PlatformStats = {
  standardizedChains: 27,
  executionChains: 16,
  lendingMarkets: 700,
  assets: 120,
  generatedAt: '',
}

declare const data: PlatformStats
export { data }

export default {
  async load(): Promise<PlatformStats> {
    try {
      const res = await fetch('https://lendwise.fi/api/stats')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as PlatformStats
    } catch (err) {
      console.warn('[stats.data] using fallback stats:', err)
      return FALLBACK
    }
  },
}
