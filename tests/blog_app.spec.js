const { test, describe, beforeEach, expect } = require('@playwright/test')

describe('blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Super user',
        username: 'admin',
        password: '141414'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'username'} )).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'password'} )).toBeVisible()
    await expect(page.getByRole('button', { name: 'login'} )).toBeVisible()
  })

  describe('Login', () => {
    // const usernameBox = await page.getByRole('textbox', { name: 'username' })
    // const passwordBox = await page.getByRole('textbox', { name: 'password' })
    // const loginButton = await page.getByRole('button', { name: 'login' })

    test('is successful with correct credentials', async ({ page }) => {
      await page.getByRole('textbox', { name: 'username' }).fill('admin')
      await page.getByRole('textbox', { name: 'password' }).fill('141414')
      await page.getByRole('button', { name: 'login' }).click()
  
      await expect(page.getByText('Super user logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByRole('textbox', { name: 'username' }).fill('not admin')
      await page.getByRole('textbox', { name: 'password' }).fill('252525')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Wrong username or password')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
    })
  })
})