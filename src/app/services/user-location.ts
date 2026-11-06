import { computed, Injectable, signal } from '@angular/core';

type Position = { lat: number; lng: number };

const DISMISSED_KEY = 'location-prompt-dismissed';
const LAST_KEY = 'last-position';
// The last position is used right away (and a new one is only asked for when it is older than this)
const FRESH_MS = 10 * 60_000;
// Older than this it is not used at all
const STALE_MS = 24 * 60 * 60_000;

// Where the user is. The browser's own permission prompt only shows after the user agrees in our modal.
@Injectable({ providedIn: 'root' })
export class UserLocation {
  readonly position = signal<Position | null>(null);
  readonly permission = signal<PermissionState | 'unknown'>('unknown');
  readonly requesting = signal(false);
  private readonly dismissed = signal(this.readDismissed());
  // One request at a time: the pages that ask together share the answer
  private pending?: Promise<boolean>;

  // The modal is only worth showing while the browser would still ask
  readonly shouldAsk = computed(
    () => this.permission() === 'prompt' && !this.dismissed() && !this.position(),
  );

  constructor() {
    this.init();
  }

  // Asks the browser for the position. Resolves to false when it was denied or failed.
  request() {
    if (!navigator.geolocation) return Promise.resolve(false);
    this.pending ??= this.locate().finally(() => (this.pending = undefined));
    return this.pending;
  }

  private locate() {
    this.requesting.set(true);
    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          this.position.set({ lat: coords.latitude, lng: coords.longitude });
          this.remember(this.position()!);
          this.permission.set('granted');
          this.requesting.set(false);
          resolve(true);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) this.permission.set('denied');
          this.requesting.set(false);
          resolve(false);
        },
        // A position the device took a few minutes ago is good enough: no new reading
        { timeout: 15_000, maximumAge: FRESH_MS },
      );
    });
  }

  dismiss() {
    this.dismissed.set(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Storage can be blocked: it will just ask again next time
    }
  }

  private async init() {
    if (!navigator.geolocation) return;

    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      this.permission.set(status.state);
      status.onchange = () => this.permission.set(status.state);
    } catch {
      // Browsers without the Permissions API: assume it hasn't been asked yet
      this.permission.set('prompt');
    }

    // Already allowed before: no need to ask again. The last position shows up at once, and a new one is only
    // read when it is old.
    if (this.permission() === 'granted') {
      const last = this.readLast();
      if (last) this.position.set(last.position);
      if (!last || Date.now() - last.at > FRESH_MS) await this.request();
    }
  }

  private remember(position: Position) {
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify({ position, at: Date.now() }));
    } catch {
      // Storage can be blocked: the position is read again next time
    }
  }

  private readLast(): { position: Position; at: number } | null {
    try {
      const last = JSON.parse(localStorage.getItem(LAST_KEY) ?? 'null');
      const valid =
        typeof last?.position?.lat === 'number' &&
        typeof last.position.lng === 'number' &&
        typeof last.at === 'number' &&
        Date.now() - last.at < STALE_MS;
      return valid ? last : null;
    } catch {
      return null;
    }
  }

  private readDismissed() {
    try {
      return localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  }
}
