import { TestBed } from '@angular/core/testing';
import { CardBrand } from './card-brand';

const render = (brand: string) => {
  const fixture = TestBed.createComponent(CardBrand);
  fixture.componentRef.setInput('brand', brand);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
};

describe('CardBrand', () => {
  it('draws a mark for each brand, hidden from screen readers', () => {
    for (const brand of [
      'visa',
      'mastercard',
      'amex',
      'discover',
      'elo',
      'diners',
      'jcb',
      'unionpay',
    ]) {
      const svg = render(brand).querySelector('svg');
      expect(svg?.getAttribute('aria-hidden'), brand).toBe('true');
      expect(svg?.querySelectorAll('circle, text, rect').length, brand).toBeGreaterThan(1);
    }
  });

  it('shows the word of Visa and the two circles of Mastercard', () => {
    expect(render('visa').textContent).toContain('VISA');
    expect(render('mastercard').querySelectorAll('circle')).toHaveLength(2);
  });

  it('has a generic card for a brand it does not know', () => {
    expect(render('unknown').querySelector('text')).toBeNull();
    expect(render('unknown').querySelectorAll('rect').length).toBeGreaterThan(1);
  });
});
