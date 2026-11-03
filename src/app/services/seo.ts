import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot } from '@angular/router';
import { environment } from '../../environments/environment';
import { INTL_LOCALE } from '../utils/locale';
import { SeoPage, SITE_NAME } from '../utils/seo';

// What a route says about itself. A page whose text depends on its data (a professional) sets it when the data is
// there, and marks the route `dynamic` so the router does not overwrite it.
export type RouteSeo = SeoPage & { dynamic?: boolean };

const defaultDescription = () =>
  $localize`Encontre profissionais de maquiagem e cabelo perto de você, veja as avaliações e agende o seu horário.`;

// The title of the tab, the description and the preview of the link (Open Graph, Twitter), the canonical address and
// the structured data: the same text for a search engine and for the person who shares the link
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  set(page: SeoPage) {
    const title = page.title === SITE_NAME ? SITE_NAME : `${page.title} | ${SITE_NAME}`;
    const description = page.description ?? defaultDescription();
    const path = page.path ?? this.document.location?.pathname ?? '/';
    const url = `${environment.siteUrl}${path}`;
    const image = this.absolute(page.image) ?? `${environment.siteUrl}/og-image.png`;
    const robots = page.noindex || !environment.indexable ? 'noindex, nofollow' : 'index, follow';

    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: robots });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: INTL_LOCALE.replace('-', '_') });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.canonical(url);
    this.jsonLd(page.jsonLd);
  }

  // The route says what it is in its `data.seo`; a route that says nothing is kept out of the search engines
  fromRoute(root: ActivatedRouteSnapshot) {
    let route = root;
    while (route.firstChild) route = route.firstChild;
    const seo = route.data['seo'] as RouteSeo | undefined;
    if (seo?.dynamic) return;
    this.set(seo ?? { title: SITE_NAME, noindex: true });
  }

  private absolute(image: string | undefined) {
    if (!image || image.startsWith('data:')) return undefined;
    return image.startsWith('/') ? `${environment.siteUrl}${image}` : image;
  }

  private canonical(url: string) {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }

  private jsonLd(data: object | undefined) {
    this.document.head.querySelectorAll('script[data-seo]').forEach((script) => script.remove());
    if (!data) return;
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', '');
    // A "<" in the text could close the script early
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    this.document.head.appendChild(script);
  }
}
