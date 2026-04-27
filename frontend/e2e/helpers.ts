import { Page } from '@playwright/test'

export const CREDENTIALS = {
  email: 'tecnico@prefeitura.rio',
  password: 'painel@2024',
}

export async function login(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('E-mail').fill(CREDENTIALS.email)
  await page.getByPlaceholder('Senha').fill(CREDENTIALS.password)
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL('**/dashboard')
}