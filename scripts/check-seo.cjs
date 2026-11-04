// Checks the prerendered pages of the production build (`npm run build`, then `node scripts/check-seo.cjs`): what a
// search engine receives before any script runs. A page that stopped being prerendered (or lost its tags) fails here.
const fs = require('node:fs');
const path = require('node:path');

const DIST = path.join(__dirname, '..', 'dist', 'find-your-beauty', 'browser');
const SITE_URL = process.env.SITE_URL || 'https://findyourbeauty.com.br';

// The pages that are written as HTML at build time (app.routes.server.ts) and what each one must have
const PAGES = [
  {
    file: 'index.html',
    lang: 'pt',
    title: 'Maquiagem e cabelo perto de você | Find Your Beauty',
    canonical: '/',
    text: 'Categorias',
    jsonLd: true,
  },
  {
    file: 'termos/index.html',
    lang: 'pt',
    title: 'Termos de Uso | Find Your Beauty',
    canonical: '/termos',
    text: 'Termos de Uso',
  },
  {
    file: 'privacidade/index.html',
    lang: 'pt',
    title: 'Política de Privacidade | Find Your Beauty',
    canonical: '/privacidade',
    text: 'Política de Privacidade',
  },
  {
    file: 'en/index.html',
    lang: 'en',
    title: 'Makeup and hair near you | Find Your Beauty',
    canonical: '/',
    text: 'Categories',
    jsonLd: true,
  },
  {
    file: 'es/index.html',
    lang: 'es',
    title: 'Maquillaje y peluquería cerca de ti | Find Your Beauty',
    canonical: '/',
    text: 'Categorías',
    jsonLd: true,
  },
];

// The problems of a page (an empty list when it is right)
const check = (html, page, siteUrl = SITE_URL) => {
  const problems = [];
  const has = (pattern) => pattern.test(html);
  if (!has(new RegExp(`<html lang="${page.lang}"`))) problems.push(`lang is not ${page.lang}`);
  if (!html.includes(`<title>${page.title}</title>`)) problems.push(`title is not "${page.title}"`);
  if (!html.includes(`<link rel="canonical" href="${siteUrl}${page.canonical}"`))
    problems.push('canonical address is missing or wrong');
  if (!has(/<meta name="description" content="[^"]{20,}"/)) problems.push('description is missing');
  if (!has(/<meta name="robots" content="index, follow"/))
    problems.push('robots is not "index, follow"');
  if (!html.includes(page.text))
    problems.push(`the text "${page.text}" is not in the HTML (the page was not prerendered)`);
  if (page.jsonLd && !has(/<script[^>]*type="application\/ld\+json"/))
    problems.push('structured data is missing');
  return problems;
};

function run() {
  let failed = 0;
  for (const page of PAGES) {
    const file = path.join(DIST, page.file);
    const problems = fs.existsSync(file)
      ? check(fs.readFileSync(file, 'utf8'), page)
      : ['the file does not exist'];
    console.log(
      `${problems.length ? 'FAIL' : 'ok  '} ${page.file}${problems.map((p) => `\n       - ${p}`).join('')}`,
    );
    failed += problems.length ? 1 : 0;
  }
  process.exit(failed ? 1 : 0);
}

module.exports = { PAGES, check };

if (require.main === module) run();
