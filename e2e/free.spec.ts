import { expect, test } from '@playwright/test';

// The sign in and the sign up of both areas say the site is free
test('the sign in and the sign up of the client and of the professional say that the site is free', async ({
  page,
}) => {
  for (const path of ['/entrar', '/cadastro', '/pro/entrar', '/pro/cadastro']) {
    await page.goto(path);
    await expect(page.getByText('O Find Your Beauty é 100% gratuito.'), path).toBeVisible();
  }
});
