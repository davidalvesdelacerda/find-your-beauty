import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// An address that does not exist. The route tells the search engines to leave it out (see app.routes.ts).
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <main class="page">
      <h1 i18n>Página não encontrada</h1>
      <p i18n>O endereço não existe ou foi movido.</p>
      <a i18n class="home" routerLink="/">Voltar ao início</a>
    </main>
  `,
  styles: `
    .page {
      max-width: 28rem;
      margin: 0 auto;
      padding: 4rem 1.5rem;
      text-align: center;
      display: grid;
      gap: 1rem;
    }

    h1 {
      font-size: 1.75rem;
    }

    p {
      color: var(--muted);
    }

    .home {
      justify-self: center;
      padding: 0.9rem 2rem;
      border-radius: var(--radius-pill);
      background: var(--primary);
      color: var(--on-primary);
      font-weight: 600;
    }
  `,
})
export class NotFound {}
