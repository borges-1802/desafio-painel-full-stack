import { test, expect } from '@playwright/test'
import { login, CREDENTIALS } from './helpers'

test.describe('Autenticação', () => {
  test('exibe a página de login ao acessar a raiz', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByPlaceholder('E-mail')).toBeVisible()
    await expect(page.getByPlaceholder('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })

  test('redireciona /dashboard para /login sem autenticação', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('redireciona /children para /login sem autenticação', async ({ page }) => {
    await page.goto('/children')
    await expect(page).toHaveURL(/\/login/)
  })

  test('redireciona /children/:id para /login sem autenticação', async ({ page }) => {
    await page.goto('/children/c001')
    await expect(page).toHaveURL(/\/login/)
  })

  test('exibe erro de validação para e-mail inválido', async ({ page }) => {
    await page.goto('/login')
    await page.waitForFunction(() => {
        const btn = document.querySelector('button[type="submit"]')
        if (!btn) return false
        return Object.keys(btn).some(k => k.startsWith('__reactFiber'))
    })
    await page.getByPlaceholder('E-mail').fill('nao-e-email')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText('E-mail inválido')).toBeVisible()
    })

    test('exibe erro de validação para senha vazia', async ({ page }) => {
    await page.goto('/login')
    await page.waitForFunction(() => {
        const btn = document.querySelector('button[type="submit"]')
        if (!btn) return false
        return Object.keys(btn).some(k => k.startsWith('__reactFiber'))
    })
    await page.getByPlaceholder('E-mail').fill(CREDENTIALS.email)
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText('Senha obrigatória')).toBeVisible()
    })

  test('exibe alerta com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('E-mail').fill(CREDENTIALS.email)
    await page.getByPlaceholder('Senha').fill('senha-errada')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByRole('alert').filter({ hasText: /credenciais/i })).toBeVisible()
  })

  test('login com sucesso redireciona para dashboard', async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText('Total de crianças')).toBeVisible()
  })

  test('botão Sair remove sessão e redireciona para login', async ({ page, isMobile }) => {
    await login(page)

    if (isMobile) {
      await page.getByRole('button', { name: /abrir menu/i }).click()
      await page.waitForSelector('[role="dialog"]', { state: 'visible' })
    }

    await page.getByRole('button', { name: /sair/i }).click()
    await expect(page).toHaveURL(/\/login/)

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})