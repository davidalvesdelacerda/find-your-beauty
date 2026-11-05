import { Component, input } from '@angular/core';

// The mark of a card brand (Stripe's `brand`: visa, mastercard, amex, discover, ...), drawn here so it needs no image
// file. The name of the brand is read by the text next to it, so the mark is hidden from screen readers.
@Component({
  selector: 'app-card-brand',
  template: `
    <svg viewBox="0 0 40 26" width="40" height="26" aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" width="39" height="25" rx="4" class="base" />
      @switch (brand()) {
        @case ('visa') {
          <text
            x="20"
            y="18"
            text-anchor="middle"
            class="word"
            fill="#1a1f71"
            font-size="10"
            font-style="italic"
          >
            VISA
          </text>
        }
        @case ('mastercard') {
          <circle cx="15" cy="13" r="7.5" fill="#eb001b" />
          <circle cx="25" cy="13" r="7.5" fill="#f79e1b" fill-opacity="0.9" />
        }
        @case ('amex') {
          <rect x="0.5" y="0.5" width="39" height="25" rx="4" fill="#1f72cd" />
          <text x="20" y="17" text-anchor="middle" class="word" fill="#fff" font-size="9">
            AMEX
          </text>
        }
        @case ('discover') {
          <text x="2.5" y="14.8" class="word" fill="#231f20" font-size="4.2">DISCOVER</text>
          <circle cx="33.5" cy="13" r="3.5" fill="#f58220" />
        }
        @case ('elo') {
          <rect x="0.5" y="0.5" width="39" height="25" rx="4" fill="#000" />
          <text x="20" y="18" text-anchor="middle" class="word" fill="#fff" font-size="13">
            elo
          </text>
        }
        @case ('diners') {
          <circle cx="20" cy="13" r="8.5" fill="#0079be" />
          <circle cx="20" cy="13" r="5.5" fill="#fff" />
          <path d="M20 7.5v11" stroke="#0079be" stroke-width="1.6" />
        }
        @case ('jcb') {
          <rect x="6" y="4" width="8" height="18" rx="2.5" fill="#0e4c96" />
          <rect x="16" y="4" width="8" height="18" rx="2.5" fill="#d6001c" />
          <rect x="26" y="4" width="8" height="18" rx="2.5" fill="#2a9a43" />
        }
        @case ('unionpay') {
          <rect x="5" y="4" width="11" height="18" rx="2.5" fill="#d10429" />
          <rect x="14.5" y="4" width="11" height="18" rx="2.5" fill="#01798a" />
          <rect x="24" y="4" width="11" height="18" rx="2.5" fill="#1d3f7c" />
        }
        @default {
          <rect x="5" y="6" width="30" height="4" fill="#6b6b6b" />
          <rect x="5" y="15" width="12" height="3" rx="1.5" fill="#6b6b6b" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }

    svg {
      display: block;
    }

    .base {
      fill: #fff;
      stroke: #d5d7dd;
    }

    .word {
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 800;
    }
  `,
})
export class CardBrand {
  readonly brand = input.required<string>();
}
