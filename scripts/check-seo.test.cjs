// node --test scripts/check-seo.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const { check } = require('./check-seo.cjs');

const page = {
  lang: 'pt',
  title: 'Termos de Uso | Find Your Beauty',
  canonical: '/termos',
  text: 'Termos de Uso',
};
const html = `<html lang="pt"><head><title>Termos de Uso | Find Your Beauty</title>
<meta name="description" content="Os termos de uso do Find Your Beauty, em português.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://findyourbeauty.com.br/termos"></head><body><h1>Termos de Uso</h1></body></html>`;

test('a prerendered page with everything passes', () => {
  assert.deepEqual(check(html, page), []);
});

test('an empty shell (a page that was not prerendered) fails on the text and on the tags', () => {
  const shell =
    '<html lang="pt"><head><title>Find your beauty</title></head><body><app-root></app-root></body></html>';
  const problems = check(shell, page);
  assert.ok(problems.some((p) => p.includes('title')));
  assert.ok(problems.some((p) => p.includes('canonical')));
  assert.ok(problems.some((p) => p.includes('not prerendered')));
});

test('a page kept out of the search engines, or in the wrong language, fails', () => {
  assert.ok(
    check(html.replace('index, follow', 'noindex, nofollow'), page).some((p) =>
      p.includes('robots'),
    ),
  );
  assert.ok(check(html.replace('lang="pt"', 'lang="en"'), page).some((p) => p.includes('lang')));
});

test('the structured data is required only where the page asks for it', () => {
  assert.ok(check(html, { ...page, jsonLd: true }).some((p) => p.includes('structured data')));
  const withLd = html.replace('</head>', '<script type="application/ld+json">{}</script></head>');
  assert.deepEqual(check(withLd, { ...page, jsonLd: true }), []);
});
