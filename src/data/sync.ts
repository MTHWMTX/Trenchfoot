// Future API sync abstraction
// This module provides the interface for syncing rules data from a remote source.
// Currently a no-op — will be implemented when an official API becomes available.

export interface SyncResult {
  updated: boolean;
  version?: string;
  error?: string;
}

export async function checkForUpdates(): Promise<SyncResult> {
  // Placeholder: No API available yet
  return { updated: false };
}

export async function syncRuleset(_rulesetId: string): Promise<SyncResult> {
  // Placeholder: No API available yet
  return { updated: false };
}
