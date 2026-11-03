// The build of Netlify picks the environment by the branch: `main` is production (findyourbeauty.com.br) and any other
// branch (develop = dev.findyourbeauty.com.br) or deploy preview is the test environment. Netlify gives the branch in
// BRANCH (for a preview it is the branch of the pull request).
const { spawnSync } = require('node:child_process');

const branch = process.env.BRANCH || '';
const production = branch === 'main';
const script = production ? 'build' : 'build:dev';
console.log(`Netlify branch "${branch}" -> npm run ${script}`);

const result = spawnSync('npm', ['run', script], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (result.status === 0 && production) {
  // robots.txt and sitemap.xml of the real site (the test site blocks everything, see build:dev)
  const seo = spawnSync('node', ['scripts/seo-files.cjs'], { stdio: 'inherit' });
  process.exit(seo.status ?? 1);
}
process.exit(result.status ?? 1);
