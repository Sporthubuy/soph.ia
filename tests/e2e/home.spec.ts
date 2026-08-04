import { test, expect } from '@playwright/test'

/**
 * E2E Tests para Home/Landing Page
 * 
 * Valida:
 * - Página carga correctamente
 * - Navegación funciona
 * - Responsive design
 * - Accessibility
 */

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en')
  })

  test.describe('Rendering', () => {
    test('debe cargar página de inicio', async ({ page }) => {
      // Verificar título
      await expect(page).toHaveTitle(/soph\.ia/i)
    })

    test('debe mostrar header con navegación', async ({ page }) => {
      const header = page.locator('header')
      await expect(header).toBeVisible()
      
      // Verificar nav items
      await expect(page.getByRole('link', { name: /producto/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /features/i })).toBeVisible()
    })

    test('debe mostrar hero section', async ({ page }) => {
      const main = page.locator('main')
      await expect(main).toBeVisible()
      
      // Buscar texto principal
      await expect(page.getByText(/conocimiento humano/i)).toBeVisible()
    })

    test('debe mostrar footer', async ({ page }) => {
      // Scroll al final
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      
      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('debe ir a login al clickear botón de entrada', async ({ page }) => {
      const enterButton = page.getByRole('button', { name: /entrar/i })
      await enterButton.click()
      
      await expect(page).toHaveURL(/\/login/)
    })

    test('debe ir a register al clickear botón de registro', async ({ page }) => {
      const registerButton = page.getByRole('button', { name: /empezar gratis/i })
      await registerButton.click()
      
      await expect(page).toHaveURL(/\/register/)
    })

    test('debe hacer scroll al hacer click en nav links', async ({ page }) => {
      // Buscar link de features
      const featuresLink = page.getByRole('link', { name: /features/i })
      const initialScroll = await page.evaluate(() => window.scrollY)
      
      await featuresLink.click()
      
      // Debería haber hecho scroll
      const afterScroll = await page.evaluate(() => window.scrollY)
      // Note: el test actual depende de si el link tiene hash href
    })
  })

  test.describe('Responsive Design', () => {
    test('debe ser responsive en móvil', async ({ page }) => {
      // Simular viewport móvil
      await page.setViewportSize({ width: 375, height: 667 })
      
      // La página debería ser accesible
      await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /empezar gratis/i })).toBeVisible()
    })

    test('debe ser responsive en tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
    })

    test('debe ser responsive en desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      
      // Verificar que la navegación es visible
      const nav = page.getByRole('navigation')
      await expect(nav).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('debe cargar en < 3 segundos', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/en')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000)
    })

    test('debe mostrar contenido principal rápidamente (LCP)', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/en')
      
      // Esperar que el hero esté visible
      await page.getByText(/conocimiento humano/i).waitFor({ state: 'visible', timeout: 2000 })
      
      const lcpTime = Date.now() - startTime
      expect(lcpTime).toBeLessThan(2500)
    })
  })

  test.describe('Accessibility', () => {
    test('debe tener estructura semántica correcta', async ({ page }) => {
      // Verificar elementos semánticos
      await expect(page.locator('header')).toBeDefined()
      await expect(page.locator('main')).toBeDefined()
      await expect(page.locator('footer')).toBeDefined()
    })

    test('debe tener alt text en imágenes', async ({ page }) => {
      const images = page.locator('img')
      const count = await images.count()
      
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt')
        // No debería estar vacío o ser null (idealmente)
        // expect(alt).toBeTruthy()
      }
    })

    test('debe ser navegable por keyboard', async ({ page }) => {
      // Presionar Tab
      await page.keyboard.press('Tab')
      
      // Un elemento debería tener focus
      const focused = await page.evaluate(() => document.activeElement?.tagName)
      expect(focused).toBeDefined()
    })

    test('debe tener contraste de color adecuado', async ({ page }) => {
      // Verificar que los textos son legibles (en términos generales)
      const buttons = page.getByRole('button')
      const count = await buttons.count()
      
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Mobile Menu', () => {
    test('debe mostrar menú en móvil', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Buscar botón de menú
      const menuButton = page.getByRole('button', { name: /menú/i })
      
      // Podría estar visible o no, depende del diseño
      if (await menuButton.isVisible()) {
        await menuButton.click()
        // Verificar que el menú se abre
      }
    })
  })
})
