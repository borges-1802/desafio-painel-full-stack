import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Lista de crianças', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('exibe lista com crianças do seed', async ({ page }) => {
    await page.goto('/children')
    await expect(page.getByText('Ana Clara Mendes')).toBeVisible()
  })

  test('exibe total de 25 crianças', async ({ page }) => {
    await page.goto('/children')
    await expect(page.getByText(/25/)).toBeVisible()
  })

  test('filtro por bairro "Rocinha" retorna apenas crianças de Rocinha', async ({ page }) => {
    await page.goto('/children?bairro=Rocinha')
    await expect(page.getByText('Ana Clara Mendes')).toBeVisible()
    await expect(page.getByText('Lucas Ferreira dos Santos')).not.toBeVisible()
  })

  test('filtro "Com alertas" mostra apenas crianças com alertas', async ({ page }) => {
    await page.goto('/children?alertas=true')
    await expect(page.getByText(/Nenhuma criança encontrada/i)).not.toBeVisible()
    await expect(page.getByText('Ana Clara Mendes')).toBeVisible()
  })

  test('filtro "Revisados" mostra apenas casos revisados', async ({ page }) => {
    await page.goto('/children?revisado=true')
    await expect(page.getByText('Sofia Lima Carvalho')).toBeVisible()
    await expect(page.getByText('Lucas Ferreira dos Santos')).not.toBeVisible() 
  })

  test('filtro "Pendentes" mostra apenas casos não revisados', async ({ page }) => {
    await page.goto('/children?revisado=false')
    await expect(page.getByText('Lucas Ferreira dos Santos')).toBeVisible()
    await expect(page.getByText('Sofia Lima Carvalho')).not.toBeVisible()
  })

  test('busca por nome filtra crianças corretamente', async ({ page }) => {
    await page.goto('/children')
    await page.getByPlaceholder(/buscar por nome/i).fill('Lucas')
    await page.waitForTimeout(500)
    await expect(page.getByText('Lucas Ferreira dos Santos')).toBeVisible()
    await expect(page.getByText('Ana Clara Mendes')).not.toBeVisible()
  })

  test('busca sem resultado exibe mensagem vazia', async ({ page }) => {
    await page.goto('/children')
    await page.getByPlaceholder(/buscar por nome/i).fill('zzznaoexiste')
    await page.waitForTimeout(500)
    await expect(page.getByText(/Nenhuma criança encontrada/i)).toBeVisible()
  })

  test('clicar em uma criança navega para o detalhe', async ({ page }) => {
    await page.goto('/children')
    await page.getByText('Ana Clara Mendes').click()
    await expect(page).toHaveURL(/\/children\/c001/)
  })

  test('paginação avança para segunda página', async ({ page }) => {
    await page.goto('/children')
    const nextBtn = page.getByRole('button', { name: 'Próxima página' })
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await page.waitForTimeout(300)
      await expect(page.getByRole('row').nth(1)).toBeVisible()
    }
  })
})
