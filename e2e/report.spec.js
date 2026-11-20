import { expect, test } from '@playwright/test';
import { register } from './helpers';

test('a neighbour reports a post once, its author cannot report it', async ({ page }) => {
  const content = `Vends mobylette ${Date.now()}`;

  // The author publishes and has no "Signaler" button on their own post
  await register(page, { firstName: 'Karim', zone: 'Saint-Michel (Toulouse)' });
  await page.getByPlaceholder(/Quoi de neuf/).fill(content);
  await page.getByRole('button', { name: 'Publier' }).click();
  const own = page.locator('.card', { hasText: content });
  await expect(own).toBeVisible();
  await expect(own.getByRole('button', { name: /Signaler/ })).toHaveCount(0);

  // A neighbour of the same zone reports it
  await page.getByRole('button', { name: 'Déconnexion' }).click();
  await register(page, { firstName: 'Chloé', zone: 'Saint-Michel (Toulouse)' });
  const post = page.locator('.card', { hasText: content });
  await post.getByRole('button', { name: /Signaler/ }).click();
  await post.getByLabel('Information erronée').check();
  await post.getByRole('button', { name: 'Envoyer le signalement' }).click();
  await expect(post.getByRole('status')).toContainText('Signalement envoyé');

  // After a reload the button is back, but a second report is refused
  await page.reload();
  const again = page.locator('.card', { hasText: content });
  await again.getByRole('button', { name: /Signaler/ }).click();
  await again.getByLabel('Autre').check();
  await again.getByRole('button', { name: 'Envoyer le signalement' }).click();
  await expect(again.getByRole('status')).toContainText('Vous avez déjà signalé ce contenu.');

  // The open panel stays within Gérard's 800x600 screen
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
