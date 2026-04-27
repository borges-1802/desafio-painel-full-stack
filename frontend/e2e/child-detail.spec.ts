import { test, expect } from '@playwright/test'
import { login } from './helpers'

// c002 – Lucas Ferreira dos Santos: não revisada, 3 áreas, múltiplos alertas (saúde + assistência)
// c003 – Sofia Lima Carvalho: revisada, educação null (dado parcial)
// c015 – Amanda Xavier Torres: todas as 3 áreas null (sem dados em nenhum sistema)
// c001 – Ana Clara Mendes: usada apenas no teste de revisão

test.describe('Detalhe da criança', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test.describe('Criança com todas as áreas preenchidas (c002)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/children/c002')
      await page.waitForSelector('h1', { timeout: 8000 })
    })

    test('exibe nome, bairro e responsável', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /lucas ferreira dos santos/i })).toBeVisible()
      await expect(page.getByText(/maré/i)).toBeVisible()
      await expect(page.getByText(/joana santos/i)).toBeVisible()
    })

    test('exibe contador de alertas ativos', async ({ page }) => {
      await expect(page.getByText(/alerta/i).first()).toBeVisible()
    })

    test('exibe seções de saúde, educação e assistência social', async ({ page }) => {
      await expect(page.getByText('Saúde')).toBeVisible()
      await expect(page.getByText('Educação')).toBeVisible()
      await expect(page.getByText('Assist. Social')).toBeVisible()
    })

    test('exibe status "Pendente de revisão" para caso não revisado', async ({ page }) => {
      await expect(page.getByText(/pendente de revisão/i)).toBeVisible()
    })

    test('exibe botão "Confirmar revisão" para caso não revisado', async ({ page }) => {
      await expect(page.getByRole('button', { name: /confirmar revisão/i })).toBeVisible()
    })
  })

  test.describe('Ação de revisão (c001)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/children/c001')
      await page.waitForSelector('h1', { timeout: 8000 })
    })

    test('abre diálogo de confirmação ao clicar em "Confirmar revisão"', async ({ page }) => {
      const reviewBtn = page.getByRole('button', { name: /confirmar revisão/i })
      if (!(await reviewBtn.isVisible())) test.skip()

      await reviewBtn.click()
      await expect(page.getByRole('dialog')).toBeVisible()
    })

    test('cancela revisão sem alterar status', async ({ page }) => {
      const reviewBtn = page.getByRole('button', { name: /confirmar revisão/i })
      if (!(await reviewBtn.isVisible())) test.skip()

      await reviewBtn.click()
      await page.getByRole('button', { name: /cancelar/i }).click()
      await expect(page.getByRole('dialog')).not.toBeVisible()
      await expect(page.getByRole('button', { name: /confirmar revisão/i })).toBeVisible()
    })

    test('confirmar revisão exibe toast de sucesso e remove botão', async ({ page }) => {
      const reviewBtn = page.getByRole('button', { name: /confirmar revisão/i })
      if (!(await reviewBtn.isVisible())) test.skip()

      await reviewBtn.click()
      await page.getByRole('dialog').getByRole('button', { name: /confirmar/i }).click()
      await expect(
        page.locator('[data-sonner-toaster]').getByText(/marcado como revisado/i)
      ).toBeVisible({ timeout: 5000 })
      await expect(
        page.getByRole('button', { name: /confirmar revisão/i })
      ).not.toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Criança já revisada com dado parcial (c003 – educação null)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/children/c003')
      await page.waitForSelector('h1', { timeout: 8000 })
    })

    test('exibe "Caso revisado" com dados do técnico', async ({ page }) => {
      await expect(page.getByText(/caso revisado/i)).toBeVisible()
      await expect(page.getByRole('strong').filter({ hasText: /tecnico@prefeitura\.rio/i })).toBeVisible()
    })

    test('não exibe botão de revisão para caso já revisado', async ({ page }) => {
      await expect(page.getByRole('button', { name: /confirmar revisão/i })).not.toBeVisible()
    })

    test('exibe "Sem dados" para área educação ausente', async ({ page }) => {
      await expect(page.getByText(/sem dados de educação cadastrados/i)).toBeVisible()
    })

    test('exibe dados de saúde e assistência normalmente', async ({ page }) => {
      await expect(page.getByText('Saúde')).toBeVisible()
      await expect(page.getByText('Assist. Social')).toBeVisible()
    })
  })

  test.describe('Criança sem dados em nenhuma área (c015)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/children/c015')
      await page.waitForSelector('h1', { timeout: 8000 })
    })

    test('exibe nome da criança', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /amanda xavier torres/i })).toBeVisible()
    })

    test('exibe "Sem dados" para todas as três áreas', async ({ page }) => {
      await expect(page.getByText(/sem dados de saúde cadastrados/i)).toBeVisible()
      await expect(page.getByText(/sem dados de educação cadastrados/i)).toBeVisible()
      await expect(page.getByText(/sem dados de assistência social cadastrados/i)).toBeVisible()
    })

    test('não exibe badge de alertas quando não há alertas', async ({ page }) => {
      await expect(page.locator('span').filter({ hasText: /^\d+ alerta/ })).not.toBeVisible()
    })
  })
})