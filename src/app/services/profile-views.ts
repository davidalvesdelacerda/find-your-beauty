import { Injectable } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { log } from '../utils/log';
import { functions } from './firebase';

const KEY = 'viewed-professionals';
// Same as the server: the same visitor counts once in this time for each professional
export const VIEW_WINDOW_MS = 6 * 3600_000;

// Has this browser counted a visit to the professional lately? Records it when it has not.
export const shouldCountView = (
  stored: Record<string, number>,
  id: string,
  now = Date.now(),
): { count: boolean; stored: Record<string, number> } => {
  if (now - (stored[id] ?? 0) < VIEW_WINDOW_MS) return { count: false, stored };
  // The old ones leave, so the list does not grow forever
  const recent = Object.fromEntries(
    Object.entries(stored).filter(([, at]) => now - at < VIEW_WINDOW_MS),
  );
  return { count: true, stored: { ...recent, [id]: now } };
};

// Counts the visits to the page of a professional (the Cloud Function adds one to her `views`)
@Injectable({ providedIn: 'root' })
export class ProfileViews {
  private readonly call = httpsCallable<{ professionalId: string }, { counted: boolean }>(
    functions,
    'registerView',
  );

  async register(id: string) {
    let stored: Record<string, number> = {};
    try {
      stored = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    } catch {
      // Without storage it counts on every visit the server accepts
    }
    const result = shouldCountView(stored, id);
    if (!result.count) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(result.stored));
    } catch {
      // Storage can be blocked
    }
    try {
      await this.call({ professionalId: id });
    } catch (error) {
      log.error('Failed to count the visit', error);
    }
  }
}
