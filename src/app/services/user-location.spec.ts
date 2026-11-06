import { TestBed } from '@angular/core/testing';
import { UserLocation } from './user-location';

const setup = (permission: PermissionState) => {
  const getCurrentPosition = vi.fn(
    (ok: PositionCallback, ...rest: [PositionErrorCallback?, PositionOptions?]) => {
      void rest;
      ok({ coords: { latitude: -22.9, longitude: -43.2 } } as GeolocationPosition);
    },
  );
  vi.stubGlobal('navigator', {
    geolocation: { getCurrentPosition },
    permissions: { query: async () => ({ state: permission }) },
  });
  return { getCurrentPosition, service: TestBed.inject(UserLocation) };
};

describe('UserLocation', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('never asks the browser by itself while the permission was not given', async () => {
    const { getCurrentPosition, service } = setup('prompt');
    await new Promise((resolve) => setTimeout(resolve));
    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(service.shouldAsk()).toBe(true);
  });

  it('shares one request between the callers and accepts a recent reading', async () => {
    const { getCurrentPosition, service } = setup('prompt');
    await Promise.all([service.request(), service.request()]);
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(getCurrentPosition.mock.calls[0][2]).toMatchObject({ maximumAge: 600_000 });
    expect(service.position()).toEqual({ lat: -22.9, lng: -43.2 });
  });

  it('uses the last position without reading again while it is recent', async () => {
    localStorage.setItem(
      'last-position',
      JSON.stringify({ position: { lat: 1, lng: 2 }, at: Date.now() - 60_000 }),
    );
    const { getCurrentPosition, service } = setup('granted');
    await new Promise((resolve) => setTimeout(resolve));
    expect(service.position()).toEqual({ lat: 1, lng: 2 });
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it('reads again when the last position is old, and keeps the new one', async () => {
    localStorage.setItem(
      'last-position',
      JSON.stringify({ position: { lat: 1, lng: 2 }, at: Date.now() - 3_600_000 }),
    );
    const { getCurrentPosition, service } = setup('granted');
    await new Promise((resolve) => setTimeout(resolve));
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(service.position()).toEqual({ lat: -22.9, lng: -43.2 });
    expect(JSON.parse(localStorage.getItem('last-position')!).position).toEqual({
      lat: -22.9,
      lng: -43.2,
    });
  });
});
