import { mkdirSync } from 'node:fs';
import { test as base, expect } from '@playwright/test';

const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await use(page);
    expect(
      errors,
      'The page should not produce uncaught JavaScript errors'
    ).toEqual([]);
  },
});

async function openPage(page, width = 1440, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('h1')).toBeVisible();
}

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`layout fits the viewport at ${width}px`, async ({ page }) => {
    await openPage(page, width, width === 1440 ? 1000 : 900);
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 1);

    if (width === 375 || width === 1440) {
      mkdirSync('artifacts', { recursive: true });
      const name = width === 375 ? 'mobile' : 'desktop';
      await page.screenshot({
        path: `artifacts/${name}.png`,
        animations: 'disabled',
      });
      await page.screenshot({
        path: `artifacts/${name}-full.png`,
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
}

test('every local navigation link has a destination', async ({ page }) => {
  await openPage(page);
  const missing = await page
    .locator('a[href^="#"]')
    .evaluateAll(links =>
      links
        .map(link => link.getAttribute('href'))
        .filter(
          href =>
            href !== '#' &&
            !document.getElementById(decodeURIComponent(href.slice(1)))
        )
    );
  expect(missing).toEqual([]);
});

test('mobile navigation is accessible, closes with Escape and follows links', async ({
  page,
}) => {
  await openPage(page, 375, 900);
  const toggle = page.locator('[data-menu-toggle]');
  const nav = page.locator('#site-nav');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).toHaveJSProperty('inert', true);
  await toggle.focus();
  await page.keyboard.press('Tab');
  expect(
    await nav.evaluate(element => element.contains(document.activeElement))
  ).toBe(false);

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav).toHaveJSProperty('inert', false);
  await page.keyboard.press('Tab');
  await expect(nav.locator('a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).toHaveJSProperty('inert', true);
  await expect(toggle).toBeFocused();

  await toggle.click();
  await nav.getByRole('link', { name: 'Как это работает' }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(nav).toHaveJSProperty('inert', true);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(nav).toHaveJSProperty('inert', false);
  await expect(
    nav.getByRole('link', { name: 'Как это работает' })
  ).toBeVisible();
});

test('carousel controls respect the beginning and end of the mobile track', async ({
  page,
}) => {
  await openPage(page, 375, 900);
  const previous = page.getByRole('button', { name: 'Предыдущие сделки' });
  const next = page.getByRole('button', { name: 'Следующие сделки' });
  const track = page.locator('#trades-track');
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  await next.click();
  await expect
    .poll(() => track.evaluate(element => element.scrollLeft))
    .toBeGreaterThan(0);
  await expect(previous).toBeEnabled();

  for (let step = 0; step < 5 && (await next.isEnabled()); step++)
    await next.click();
  await expect(next).toBeDisabled();
  expect(
    await track.evaluate(element =>
      Math.abs(element.scrollWidth - element.clientWidth - element.scrollLeft)
    )
  ).toBeLessThanOrEqual(1);

  for (let step = 0; step < 5 && (await previous.isEnabled()); step++)
    await previous.click();
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  await expect
    .poll(() => track.evaluate(element => element.scrollLeft))
    .toBeLessThanOrEqual(1);
});

test('FAQ works with Enter and Space without custom pointer interactions', async ({
  page,
}) => {
  await openPage(page);
  const item = page.locator('.faq-list details').nth(1);
  const summary = item.locator('summary');
  await expect(item).toHaveJSProperty('open', false);
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(item).toHaveJSProperty('open', true);
  await expect(item.locator('p')).toBeVisible();
  await page.keyboard.press('Space');
  await expect(item).toHaveJSProperty('open', false);
  await expect(item.locator('p')).toBeHidden();
});

test('signup preserves the selected plan, validates email and honestly reports unavailability', async ({
  page,
}) => {
  await openPage(page);
  const trigger = page.getByRole('button', { name: 'Попробовать VIP' });
  const dialog = page.getByRole('dialog');
  const email = dialog.getByRole('textbox', { name: 'Ваш e-mail' });
  const submit = dialog.getByRole('button', { name: 'Проверить доступность' });
  const feedback = dialog.getByRole('status');
  const outgoing = [];
  page.on('request', request => {
    if (
      request.method() !== 'GET' ||
      request.url().includes('smoke%40example.com') ||
      request.url().includes('smoke@example.com')
    )
      outgoing.push(request.url());
  });

  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#signup-context')).toContainText('VIP');
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute('required', '');
  await submit.click();
  expect(await email.evaluate(element => element.validity.valueMissing)).toBe(
    true
  );
  await expect(feedback).toBeHidden();
  await email.fill('not-an-email');
  await submit.click();
  expect(await email.evaluate(element => element.validity.typeMismatch)).toBe(
    true
  );
  await expect(feedback).toBeHidden();

  await email.fill('smoke@example.com');
  await submit.click();
  await expect(feedback).toContainText('Регистрация пока недоступна');
  await expect(feedback).toContainText('Ваш e-mail никуда не отправлен');
  await expect(page.locator('#signup-email')).toHaveValue('');
  expect(outgoing).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  const standard = page.getByRole('button', { name: 'Попробовать Standard' });
  await standard.click();
  await expect(page.locator('#signup-context')).toContainText('Standard');
  await expect(page.locator('#signup-context')).not.toContainText('VIP');
  await expect(page.locator('#signup-email')).toHaveValue('');
  await expect(feedback).toBeHidden();
  await email.fill('smoke@example.com');
  await dialog.getByRole('button', { name: 'Закрыть окно' }).click();
  await expect(page.locator('#signup-email')).toHaveValue('');
  await expect(standard).toBeFocused();
});

test('hero email moves into the dialog and clears on close', async ({
  page,
}) => {
  await openPage(page, 375, 900);
  const form = page.locator('[data-signup-entry]');
  const entryEmail = form.getByRole('textbox', { name: 'Ваш e-mail' });
  const submit = form.getByRole('button', { name: 'Попробовать' });
  const dialog = page.getByRole('dialog');
  await submit.click();
  await expect(dialog).toBeHidden();
  await entryEmail.fill('smoke@example.com');
  await submit.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Ваш e-mail' })).toHaveValue(
    'smoke@example.com'
  );
  await expect(entryEmail).toHaveValue('');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('#signup-email')).toHaveValue('');
  await expect(submit).toBeFocused();
});

test('signup from the mobile menu restores focus to the menu toggle', async ({
  page,
}) => {
  await openPage(page, 375, 900);
  const toggle = page.locator('[data-menu-toggle]');
  await toggle.click();
  await page
    .locator('#site-nav')
    .getByRole('button', { name: 'Начать бесплатно' })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#site-nav')).toHaveJSProperty('inert', true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('short landscape navigation scrolls to the signup action', async ({
  page,
}) => {
  await openPage(page, 667, 320);
  await page.locator('[data-menu-toggle]').click();
  const nav = page.locator('#site-nav');
  const signup = nav.getByRole('button', { name: 'Начать бесплатно' });
  const bounds = await nav.boundingBox();
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(321);
  await signup.scrollIntoViewIfNeeded();
  await expect(signup).toBeInViewport();
  await signup.click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
