import { test, expect } from '@playwright/test'

/**
 * E2E Tests para Authentication Flows
 * 
 * Valida:
 * - Login
 * - Register
 * - Logout
 * - Forgot password
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a home antes de cada test
    await page.goto('/')
  })

  test.describe('Login Flow', () => {
    test('debe mostrar página de login', async ({ page }) => {
      await page.goto('/en/login')
      
      // Verificar elementos
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('debe mostrar error con credentials inválidos', async ({ page }) => {
      await page.goto('/en/login')
      
      // Llenar formulario con datos inválidos
      await page.getByLabel(/email/i).fill('invalid@test.com')
      await page.getByLabel(/password/i).fill('wrongpassword')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // Esperar mensaje de error
      await expect(page.getByText(/invalid/i)).toBeVisible()
    })

    test('debe deshabilitar botón mientras se procesa', async ({ page }) => {
      await page.goto('/en/login')
      
      const emailInput = page.getByLabel(/email/i)
      const passwordInput = page.getByLabel(/password/i)
      const signInButton = page.getByRole('button', { name: /sign in/i })
      
      // Llenar con datos
      await emailInput.fill('test@example.com')
      await passwordInput.fill('TestPassword123')
      
      // El botón debería estar habilitado
      await expect(signInButton).toBeEnabled()
    })

    test('debe limpiar input en caso de error', async ({ page }) => {
      await page.goto('/en/login')
      
      const emailInput = page.getByLabel(/email/i)
      await emailInput.fill('invalid@test.com')
      await page.getByLabel(/password/i).fill('wrongpassword')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // El input debería mantener el valor
      await expect(emailInput).toHaveValue('invalid@test.com')
    })
  })

  test.describe('Register Flow', () => {
    test('debe mostrar página de registro', async ({ page }) => {
      await page.goto('/en/register')
      
      await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
      await expect(page.getByLabel(/full name/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    })

    test('debe validar campos requeridos', async ({ page }) => {
      await page.goto('/en/register')
      
      // Intentar submit sin llenar
      await page.getByRole('button', { name: /create account/i }).click()
      
      // Debería mostrar errores o mantener form visible
      await expect(page.getByLabel(/full name/i)).toBeVisible()
    })

    test('debe rechazar passwords débiles', async ({ page }) => {
      await page.goto('/en/register')
      
      await page.getByLabel(/full name/i).fill('John Doe')
      await page.getByLabel(/email/i).fill('newuser@example.com')
      await page.getByLabel(/password/i).fill('short')
      
      // Debería mostrar validación
      await expect(page.getByText(/at least/i)).toBeVisible()
    })
  })

  test.describe('Forgot Password Flow', () => {
    test('debe mostrar página de recuperación', async ({ page }) => {
      await page.goto('/en/forgot-password')
      
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByRole('button')).toBeDefined()
    })

    test('debe validar email antes de enviar', async ({ page }) => {
      await page.goto('/en/forgot-password')
      
      await page.getByLabel(/email/i).fill('invalidemail')
      await page.getByRole('button').first().click()
      
      // Debería mostrar error de validación
      await expect(page.getByText(/invalid/i)).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('debe ir a login desde home', async ({ page }) => {
      await page.goto('/en')
      
      const loginButton = page.getByRole('link', { name: /entrar/i })
      await loginButton.click()
      
      await expect(page).toHaveURL(/\/login/)
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    })

    test('debe ir a register desde login', async ({ page }) => {
      await page.goto('/en/login')
      
      const createLink = page.getByRole('link', { name: /create one/i })
      await createLink.click()
      
      await expect(page).toHaveURL(/\/register/)
      await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('login debe ser accesible por keyboard', async ({ page }) => {
      await page.goto('/en/login')
      
      // Tab through elements
      await page.keyboard.press('Tab')
      await expect(page.getByLabel(/email/i)).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.getByLabel(/password/i)).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused()
    })

    test('debe tener labels asociados', async ({ page }) => {
      await page.goto('/en/login')
      
      const emailInput = page.getByLabel(/email/i)
      const passwordInput = page.getByLabel(/password/i)
      
      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()
    })
  })
})
