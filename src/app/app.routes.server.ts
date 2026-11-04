import { RenderMode, ServerRoute } from '@angular/ssr';

// Which pages are written as HTML at build time. Only the ones that do not depend on the user or on the catalog:
// everything else (the map, the accounts, the page of a professional) starts in the browser, from index.csr.html.
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'termos', renderMode: RenderMode.Prerender },
  { path: 'privacidade', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
