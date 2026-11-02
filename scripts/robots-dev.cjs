// Post-build step of the test site. Its robots.txt blocks everything, so it does not show up in search engines, and
// its icons carry a "TEST" band (scripts/make-icons-dev.cjs), so the installed PWA is not mistaken for production.
const fs = require('node:fs');
const path = require('node:path');

const dist = path.join(__dirname, '..', 'dist', 'find-your-beauty', 'browser');
fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log('robots.txt (Disallow) written to', dist);

fs.cpSync(path.join(__dirname, 'icons-dev'), path.join(dist, 'icons'), { recursive: true });
console.log('icons with the TEST band copied to', path.join(dist, 'icons'));
