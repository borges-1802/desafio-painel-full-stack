import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('exibe os quatro cards de resumo', async ({ page }) => {
    await expect(page.getByRole('link', { name: /total de crianças/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /crianças com alertas/i })).toBeVisible()
    await expect(page.getByText('Casos Revisados')).toBeVisible()
    await expect(page.getByText('Casos Pendentes')).toBeVisible()
  })

  test('card "Total de crianças" exibe 25', async ({ page }) => {
    const card = page.getByRole('link', { name: /total de crianças/i })
    await expect(card.getByText('25')).toBeVisible()
  })

  test('card "Total de crianças" leva para /children', async ({ page }) => {
    await page.getByRole('link', { name: /total de crianças/i }).click()
    await expect(page).toHaveURL(/\/children/)
  })

  test('card "Crianças com alertas" leva para /children?alertas=true', async ({ page }) => {
    await page.getByRole('link', { name: /crianças com alertas/i }).click()
    await expect(page).toHaveURL(/alertas=true/)
  })

  test('card "Casos Revisados" leva para /children?revisado=true', async ({ page }) => {
    await page.getByText('Casos Revisados').click()
    await expect(page).toHaveURL(/revisado=true/)
  })

  test('card "Casos Pendentes" leva para /children?revisado=false', async ({ page }) => {
    await page.getByText('Casos Pendentes').click()
    await expect(page).toHaveURL(/revisado=false/)
  })

  test('exibe alertas por área (saúde, educação, assistência)', async ({ page }) => {
    await expect(page.getByText(/saúde/i).first()).toBeVisible()
    await expect(page.getByText(/educação/i).first()).toBeVisible()
    await expect(page.getByText(/assistência/i).first()).toBeVisible()
  })

  test('link "Crianças" na sidebar navega para /children', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/children')
    } else {
      await page.getByRole('navigation').getByRole('link', { name: 'Crianças' }).click()
    }
    await expect(page).toHaveURL(/\/children/)
  })
})