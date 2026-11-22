'use client';

import { getFirebaseApp } from './firebase';

export const CURRENT_APP_VERSION = '1.0.0';
export const CURRENT_WEB_BUILD =
  process.env.NEXT_PUBLIC_APP_BUILD || '2026.11.22.1';

export interface AppUpdatePolicy {
  ios?: {
    minSupportedVersion?: string;
    latestVersion?: string;
    storeUrl?: string;
  };
  android?: {
    minSupportedVersion?: string;
    latestVersion?: string;
    storeUrl?: string;
  };
  web?: {
    minSupportedBuild?: string;
    latestBuild?: string;
  };
  titlePl?: string;
  highlightsPl?: string[];
  remindAfterHours?: number;
}

export type UpdateCheckMode = 'none' | 'soft' | 'force';

export interface UpdateCheckResult {
  mode: UpdateCheckMode;
  policy: AppUpdatePolicy | null;
  latestLabel?: string;
}

/**
 * Porównuje wersje kropkowe typu `1.2.0` lub `2026.11.25.1`.
 * Zwraca < 0 gdy a < b, 0 gdy równe, > 0 gdy a > b.
 */
export function compareDottedVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

export function evaluateUpdatePolicy(policy: AppUpdatePolicy | null): UpdateCheckResult {
  if (!policy) return { mode: 'none', policy: null };

  const web = policy.web;
  if (web?.minSupportedBuild && compareDottedVersions(CURRENT_WEB_BUILD, web.minSupportedBuild) < 0) {
    return {
      mode: 'force',
      policy,
      latestLabel: web.latestBuild ?? web.minSupportedBuild,
    };
  }
  if (web?.latestBuild && compareDottedVersions(CURRENT_WEB_BUILD, web.latestBuild) < 0) {
    return {
      mode: 'soft',
      policy,
      latestLabel: web.latestBuild,
    };
  }

  return { mode: 'none', policy };
}

export async function fetchAppUpdatePolicy(): Promise<UpdateCheckResult> {
  if (typeof window === 'undefined') return { mode: 'none', policy: null };
  const app = getFirebaseApp();
  if (!app) return { mode: 'none', policy: null };

  try {
    const { getRemoteConfig, fetchAndActivate, getValue } = await import('firebase/remote-config');
    const rc = getRemoteConfig(app);
    rc.settings.minimumFetchIntervalMillis = 5 * 60 * 1000; // 5 min cache (0 readów Firestore!)
    await fetchAndActivate(rc);
    const raw = getValue(rc, 'app_update_policy').asString();
    if (!raw) return { mode: 'none', policy: null };
    const parsed = JSON.parse(raw) as AppUpdatePolicy;
    return evaluateUpdatePolicy(parsed);
  } catch {
    return { mode: 'none', policy: null };
  }
}
